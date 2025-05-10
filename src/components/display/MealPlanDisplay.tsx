"use client"; 

import type { GenerateCustomMealPlanOutput, GenerateCustomMealPlanInput } from "@/ai/flows/generate-custom-meal-plan"; // Assuming Meal is from here
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, ListChecks, ShoppingCart, UtensilsCrossed, Download, Loader2, CalendarPlus, Heart, Minus, Plus, Info } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import html2pdf from 'html2pdf.js';
import { useToast } from "@/hooks/use-toast";
import { getAuthUser, saveFavoriteRecipe, removeFavoriteRecipe, isRecipeFavorite, type AuthUser, type FavoriteRecipe } from "@/lib/authLocalStorage";

interface MealPlanDisplayProps {
  data: GenerateCustomMealPlanOutput;
}

// Extracting Meal type based on usage within GenerateCustomMealPlanOutput
type Meal = NonNullable<GenerateCustomMealPlanOutput['dailyPlans']>[number]['meals'][number];


export function MealPlanDisplay({ data }: MealPlanDisplayProps) {
  const mealPlanCardRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const { toast } = useToast();
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [favoriteRecipes, setFavoriteRecipes] = useState<string[]>([]);
  // State for recipe servings - a map of meal ID to current servings
  const [recipeServings, setRecipeServings] = useState<Record<string, number>>({});


  const generateMealId = (dayIndex: number, mealIndex: number, meal: Meal) => {
    return `${data.mealPlanTitle.replace(/\s+/g, '-')}-${dayIndex}-${mealIndex}-${meal.dish.replace(/\s+/g, '-')}`;
  }

  useEffect(() => {
    const user = getAuthUser();
    setAuthUser(user);
    if (user && data.dailyPlans) {
      const initialFavs: string[] = [];
      const initialServings: Record<string, number> = {};
      data.dailyPlans.forEach((dailyPlan, dayIdx) => {
        dailyPlan.meals.forEach((meal, mealIdx) => {
          const mealId = generateMealId(dayIdx, mealIdx, meal);
          if (isRecipeFavorite(user.id, mealId)) {
            initialFavs.push(mealId);
          }
          initialServings[mealId] = meal.servings || 1; // Initialize servings
        });
      });
      setFavoriteRecipes(initialFavs);
      setRecipeServings(initialServings);
    }
  }, [data, authUser?.id]); // Added authUser.id as dependency

  const handleToggleFavorite = useCallback((mealId: string, meal: Meal, dayName?: string) => {
    if (!authUser) {
      toast({ variant: "destructive", title: "Not Logged In", description: "Please log in to save favorites." });
      return;
    }
    const isFav = favoriteRecipes.includes(mealId);
    if (isFav) {
      removeFavoriteRecipe(authUser.id, mealId);
      setFavoriteRecipes(prev => prev.filter(id => id !== mealId));
      toast({ title: "Recipe Removed", description: `"${meal.dish}" removed from favorites.` });
    } else {
      const favRecipeData: Omit<FavoriteRecipe, 'addedAt'> = {
        id: mealId,
        day: dayName,
        mealName: meal.name,
        dishName: meal.dish,
        recipeContent: meal.recipe,
        servings: recipeServings[mealId] || meal.servings || 1,
        notes: meal.notes,
        substitutions: meal.substitutions
      };
      saveFavoriteRecipe(authUser.id, favRecipeData);
      setFavoriteRecipes(prev => [...prev, mealId]);
      toast({ title: "Recipe Favorited!", description: `"${meal.dish}" added to favorites.` });
    }
  }, [authUser, favoriteRecipes, toast, recipeServings]);


  const handleDownloadPdf = () => {
    if (!mealPlanCardRef.current) {
      console.error("Meal plan element not found for PDF generation.");
      return;
    }
    setIsGeneratingPdf(true);
    const elementToPrint = mealPlanCardRef.current;
    const safeTitle = data.mealPlanTitle ? data.mealPlanTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'custom_meal_plan';
    const pdfFilename = `${safeTitle}.pdf`;
    const opt = {
      margin: 0.5, filename: pdfFilename, image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    html2pdf().from(elementToPrint).set(opt).save()
      .then(() => setIsGeneratingPdf(false))
      .catch((err: Error) => {
        console.error("Error generating PDF:", err);
        setIsGeneratingPdf(false);
        toast({ variant: "destructive", title: "PDF Error", description: "Could not generate PDF." });
      });
  };

  const handleServingsChange = (mealId: string, change: number) => {
    setRecipeServings(prev => {
      const currentServings = prev[mealId] || 1;
      const newServings = Math.max(1, currentServings + change); // Ensure servings don't go below 1
      // TODO: If favorited, update servings in local storage too
      return { ...prev, [mealId]: newServings };
    });
    // Here you would ideally re-calculate ingredient quantities if backend supported it
    // For now, it's a UI change demonstrating the feature.
    toast({
        title: "Servings Adjusted (UI)",
        description: "Actual ingredient scaling would require AI re-calculation or structured recipe data.",
        duration: 3000
    })
  };


  return (
    <div className="mt-8 space-y-6">
      <Card className="shadow-lg" data-ai-hint="cache results meal plan" ref={mealPlanCardRef}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex-grow">
              <CardTitle className="text-2xl text-primary">{data.mealPlanTitle || "Your Custom Meal Plan"}</CardTitle>
              <CardDescription>Here's a personalized plan crafted just for you.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <Button
                variant="outline" size="sm" onClick={handleDownloadPdf} disabled={isGeneratingPdf}
                aria-label="Download meal plan as PDF" className="text-xs"
              >
                {isGeneratingPdf ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-1.5 h-3.5 w-3.5" />}
                {isGeneratingPdf ? "Saving..." : "PDF"}
              </Button>
              <Button variant="outline" size="sm" disabled={true} aria-label="Add to calendar" className="text-xs">
                <CalendarPlus className="mr-1.5 h-3.5 w-3.5" /> Add to Calendar (Soon)
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full" defaultValue={`day-0`}>
            {data.dailyPlans?.map((dailyPlan, dayIndex) => (
              <AccordionItem value={`day-${dayIndex}`} key={`day-${dayIndex}`}>
                <AccordionTrigger className="text-lg font-semibold hover:text-accent">
                  {dailyPlan.day}
                  {dailyPlan.estimatedCalories && (
                     <span className="text-sm font-normal text-muted-foreground ml-2">
                       (~{dailyPlan.estimatedCalories} kcal)
                     </span>
                  )}
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pl-2">
                  {dailyPlan.meals?.map((meal, mealIndex) => {
                    const mealId = generateMealId(dayIndex, mealIndex, meal);
                    const currentServings = recipeServings[mealId] || meal.servings || 1;
                    const isFav = favoriteRecipes.includes(mealId);
                    return (
                      <div key={mealId} className="p-3 rounded-md border border-border/70 bg-card/50 relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "absolute top-2 right-2 h-7 w-7",
                            isFav ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-red-400"
                          )}
                          onClick={() => handleToggleFavorite(mealId, meal, dailyPlan.day)}
                          aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Heart className={cn("h-5 w-5", isFav && "fill-current")} />
                        </Button>
                        <h4 className="font-medium text-md text-primary-foreground bg-primary rounded-t-md px-3 py-1 -mx-3 -mt-3 mb-2 flex justify-between items-center">
                          <span>{meal.name}: {meal.dish}</span>
                          <div className="flex items-center space-x-1 bg-primary-foreground/20 px-1.5 py-0.5 rounded text-xs">
                            <Button variant="ghost" size="icon" className="h-5 w-5 p-0 hover:bg-primary-foreground/30" onClick={() => handleServingsChange(mealId, -1)} disabled={currentServings <=1}>
                              <Minus className="h-3 w-3"/>
                            </Button>
                            <span>{currentServings} Serv.</span>
                            <Button variant="ghost" size="icon" className="h-5 w-5 p-0 hover:bg-primary-foreground/30" onClick={() => handleServingsChange(mealId, 1)}>
                              <Plus className="h-3 w-3"/>
                            </Button>
                          </div>
                        </h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-1">{meal.recipe}</p>
                        {meal.substitutions && meal.substitutions.length > 0 && (
                          <div className="mt-2 text-xs">
                            <p className="font-medium text-muted-foreground">Substitutions:</p>
                            <ul className="list-disc list-inside pl-2 text-muted-foreground/80">
                              {meal.substitutions.map((sub, i) => <li key={i}>{sub}</li>)}
                            </ul>
                          </div>
                        )}
                        {meal.notes && <p className="text-xs text-muted-foreground/80 italic mt-2">Note: {meal.notes}</p>}
                      </div>
                    );
                  })}
                  {(dailyPlan.estimatedProtein || dailyPlan.estimatedCarbs || dailyPlan.estimatedFats) && (
                    <div className="mt-2 p-2 border-t border-dashed">
                      <p className="text-xs text-muted-foreground">
                        Est. Macros: 
                        {dailyPlan.estimatedProtein && ` Protein: ${dailyPlan.estimatedProtein}`}
                        {dailyPlan.estimatedCarbs && `, Carbs: ${dailyPlan.estimatedCarbs}`}
                        {dailyPlan.estimatedFats && `, Fats: ${dailyPlan.estimatedFats}`}
                      </p>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {data.shoppingList && data.shoppingList.length > 0 && (
        <Card className="shadow-lg" data-ai-hint="cache results shopping list">
          <CardHeader>
            <CardTitle className="text-xl flex items-center text-primary"><ListChecks className="mr-2 h-6 w-6"/>Shopping List</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-60">
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                {data.shoppingList.map((item, index) => (
                  <li key={index} className="text-sm text-card-foreground/90 flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </ScrollArea>
            <div className="mt-4 text-center space-x-2">
              <Button variant="outline" disabled>
                <ShoppingCart className="mr-2 h-4 w-4" /> Order with Instacart (Soon)
              </Button>
              <Button variant="outline" disabled>
                <ShoppingCart className="mr-2 h-4 w-4" /> Order with Amazon Fresh (Soon)
              </Button>
            </div>
             <p className="text-xs text-muted-foreground text-center mt-2">Grocery delivery integration coming soon!</p>
          </CardContent>
        </Card>
      )}

      {data.preparationTips && data.preparationTips.length > 0 && (
        <Card className="shadow-lg" data-ai-hint="cache results prep tips">
          <CardHeader>
            <CardTitle className="text-xl flex items-center text-primary"><UtensilsCrossed className="mr-2 h-6 w-6" />Preparation Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.preparationTips.map((tip, index) => (
                <li key={index} className="flex items-start text-sm text-card-foreground/90">
                   <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 shrink-0" /> {tip}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
