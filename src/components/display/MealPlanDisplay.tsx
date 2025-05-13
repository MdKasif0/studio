
"use client"; 

import type { GenerateCustomMealPlanOutput, GenerateCustomMealPlanInput } from "@/ai/flows/generate-custom-meal-plan"; // Assuming Meal is from here
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, ListChecks, ShoppingCart, UtensilsCrossed, Download, Loader2, CalendarPlus, Heart, Minus, Plus, Info, AlertTriangle, Clock3 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRef, useState, useEffect, useCallback } from "react";
import html2pdf from 'html2pdf.js';
import { useToast } from "@/hooks/use-toast";
import { getAuthUser, saveFavoriteRecipe, removeFavoriteRecipe, isRecipeFavorite, type AuthUser, type FavoriteRecipe, getUserDetails } from "@/lib/authLocalStorage";
import { cn } from "@/lib/utils"; 
import { commonDietaryRestrictions } from "@/lib/schemas/authSchemas";


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
  const [userDietaryRestrictions, setUserDietaryRestrictions] = useState<Record<string, boolean | string>>({});


  const generateMealId = (dayIndex: number, mealIndex: number, meal: Meal) => {
    return `${data.mealPlanTitle.replace(/\s+/g, '-')}-${dayIndex}-${mealIndex}-${meal.dish.replace(/\s+/g, '-')}`;
  }

  useEffect(() => {
    const user = getAuthUser();
    setAuthUser(user);
    if (user) {
      const details = getUserDetails(user.id);
      if (details?.dietaryRestrictions) {
        setUserDietaryRestrictions(details.dietaryRestrictions);
      }
      if (data.dailyPlans) {
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
    }
  }, [data, authUser?.id]); // Removed authUser from dependencies, only id matters

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
      toast({ variant: "destructive", title: "Error", description: "Meal plan content not found for PDF generation." });
      return;
    }
    setIsGeneratingPdf(true);

    const originalElement = mealPlanCardRef.current;
    const elementToPrint = originalElement.cloneNode(true) as HTMLElement;

    // --- Apply PDF-specific styles and modifications to the CLONE ---
    elementToPrint.style.backgroundColor = 'white';
    elementToPrint.style.color = 'black';
    elementToPrint.style.fontFamily = 'Arial, sans-serif';
    elementToPrint.style.width = '100%'; 
    elementToPrint.style.boxSizing = 'border-box';

    elementToPrint.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, li, div, button, input, textarea, label, legend, strong, em, small').forEach(el => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.color = 'black'; // Ensure all text is black by default
        htmlEl.style.backgroundColor = 'transparent'; // Ensure no dark backgrounds from theme persist
        if(htmlEl.classList.contains('bg-primary')) {
            htmlEl.style.backgroundColor = '#e0e0e0'; // Light grey for primary background areas
        }
         if (htmlEl.classList.contains('text-primary')) {
            htmlEl.style.color = '#003366'; // Dark blue for primary text
        }
        if (htmlEl.classList.contains('text-accent')) {
            htmlEl.style.color = '#8B0000'; // Dark red for accent text
        }
        if (htmlEl.classList.contains('text-primary-foreground')) {
            htmlEl.style.color = '#000000'; // Black for primary foreground
        }
        if (htmlEl.classList.contains('text-muted-foreground')) {
             htmlEl.style.color = '#444444'; // Darker grey for muted text
        }
    });
    
    elementToPrint.querySelectorAll('.shadow-lg, .shadow-xl').forEach(card => {
        (card as HTMLElement).style.boxShadow = 'none';
        (card as HTMLElement).style.border = '1px solid #ddd';
        (card as HTMLElement).style.backgroundColor = 'white';
        (card as HTMLElement).style.marginBottom = '10px';
    });
    
    elementToPrint.querySelectorAll('.text-primary').forEach(el => (el as HTMLElement).style.color = '#003366');
    elementToPrint.querySelectorAll('.bg-primary').forEach(el => {
        (el as HTMLElement).style.backgroundColor = '#f0f8ff'; // Very light blue for primary backgrounds
        (el as HTMLElement).style.color = '#003366';
        (el as HTMLElement).style.padding = '8px';
        (el as HTMLElement).style.borderRadius = '4px';
    });
     elementToPrint.querySelectorAll('.text-accent').forEach(el => (el as HTMLElement).style.color = '#8B0000'); // Dark red for accent text


    // Ensure all accordion items are open and styled for print
    elementToPrint.querySelectorAll('div[data-radix-accordion-item]').forEach(item => {
        const trigger = item.querySelector('button[data-radix-accordion-trigger]') as HTMLElement | null;
        const content = item.querySelector('div[data-radix-accordion-content]') as HTMLElement | null;

        if (trigger) {
            trigger.style.fontWeight = 'bold';
            trigger.style.fontSize = '1.1em';
            trigger.style.padding = '10px 0';
            trigger.style.borderBottom = '1px solid #ccc';
            trigger.style.marginBottom = '10px';
            const chevron = trigger.querySelector('svg');
            if (chevron) chevron.style.display = 'none';
        }
        if (content) {
            content.setAttribute('data-state', 'open');
            content.style.display = 'block';
            content.style.height = 'auto';
            content.style.opacity = '1';
            content.style.visibility = 'visible';
            content.style.overflow = 'visible';
            // Remove animation classes that might hide content
            content.classList.remove('data-[state=closed]:animate-accordion-up', 'data-[state=open]:animate-accordion-down');
        }
    });
    
    // Ensure ScrollArea content is fully visible
    elementToPrint.querySelectorAll('div[data-radix-scroll-area-viewport]').forEach(viewport => {
        (viewport as HTMLElement).style.height = 'auto';
        (viewport as HTMLElement).style.overflow = 'visible';
    });
    elementToPrint.querySelectorAll('.scrollbar-thin').forEach(scrollAreaRoot => {
         (scrollAreaRoot as HTMLElement).style.overflow = 'visible'; // for the root of scrollarea
    });

    // Hide irrelevant buttons explicitly
    elementToPrint.querySelectorAll('button').forEach(btn => {
        const button = btn as HTMLElement;
        const ariaLabel = button.getAttribute('aria-label') || "";
        const buttonText = button.textContent?.trim().toLowerCase() || "";

        if (ariaLabel.includes('Download meal plan as PDF') || 
            ariaLabel.includes('Add to calendar') ||
            ariaLabel.includes('Add to favorites') ||
            ariaLabel.includes('Remove from favorites') ||
            buttonText.includes('order with instacart') ||
            buttonText.includes('order with amazon fresh')) {
            button.style.display = 'none';
        }
        // Preserve serving adjustment buttons
        if(buttonText.includes('serv.')) {
            button.style.border = '1px solid #ccc';
            button.style.padding = '2px 4px';
        }
    });
     elementToPrint.querySelectorAll('.lucide-heart').forEach(icon => (icon as HTMLElement).style.display = 'none');


    // Add a clear title for the PDF
    const pdfTitleElement = document.createElement('div');
    pdfTitleElement.innerHTML = `
      <h1 style="text-align: center; font-size: 22px; margin-bottom: 5px; color: #003366;">Nutri AI Meal Plan</h1>
      <h2 style="text-align: center; font-size: 18px; margin-bottom: 20px; color: #333;">${data.mealPlanTitle || "Custom Plan"}</h2>
    `;
    elementToPrint.insertBefore(pdfTitleElement, elementToPrint.firstChild);

    // Wrap the cloned element in a container that html2pdf will use
    const printContainer = document.createElement('div');
    printContainer.style.position = 'absolute';
    printContainer.style.left = '-9999px'; // Position off-screen to avoid visual flash
    printContainer.style.width = '210mm'; // A4 width to help with layout calculation
    printContainer.style.backgroundColor = 'white'; // Ensure container itself has white bg
    printContainer.appendChild(elementToPrint);
    document.body.appendChild(printContainer);
    
    const safeTitle = data.mealPlanTitle ? data.mealPlanTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'nutriai_meal_plan';
    const pdfFilename = `${safeTitle}.pdf`;

    const opt = {
      margin: 10, //統一邊距為10mm
      filename: pdfFilename,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().from(printContainer).set(opt).save()
      .then(() => {
        toast({ title: "PDF Downloaded", description: "Your meal plan has been saved as a PDF." });
      })
      .catch((err: Error) => {
        console.error("Error generating PDF:", err);
        toast({ variant: "destructive", title: "PDF Error", description: "Could not generate PDF. " + err.message });
      })
      .finally(() => {
        setIsGeneratingPdf(false);
        document.body.removeChild(printContainer); // Clean up the temporary container
      });
  };


  const handleServingsChange = (mealId: string, change: number) => {
    setRecipeServings(prev => {
      const currentServings = prev[mealId] || 1;
      const newServings = Math.max(1, currentServings + change); // Ensure servings don't go below 1
      return { ...prev, [mealId]: newServings };
    });
    toast({
        title: "Servings Adjusted (UI)",
        description: "Actual ingredient scaling requires AI re-calculation or structured recipe data.",
        duration: 3000
    })
  };

  const checkForAllergens = useCallback((meal: Meal): string[] => {
    const allergensFound: string[] = [];
    if (!userDietaryRestrictions || Object.keys(userDietaryRestrictions).length === 0) return allergensFound;

    const recipeText = `${meal.dish.toLowerCase()} ${meal.recipe.toLowerCase()} ${meal.notes?.toLowerCase() || ''}`;
    
    const keywordsForAllergyMap: { [key in keyof typeof commonDietaryRestrictions]?: string[] } = {
      nutAllergy: ['nut', 'nuts', 'almond', 'walnut', 'cashew', 'pecan', 'pistachio', 'macadamia', 'peanut'],
      shellfishAllergy: ['shellfish', 'shrimp', 'crab', 'lobster', 'oyster', 'mussel', 'clam', 'prawn'],
      soyAllergy: ['soy', 'tofu', 'tempeh', 'miso', 'edamame', 'soybean', 'soy sauce'],
      // For dairyFree and glutenFree, if the user *IS* dairyFree/glutenFree, we look for ingredients that *AREN'T* these.
      // This is tricky with simple keyword search. The AI should ideally handle this.
      // For now, this alert focuses on positive matches for allergies.
    };

    Object.entries(userDietaryRestrictions).forEach(([restrictionKey, isActiveOrOther]) => {
      if (isActiveOrOther === true && keywordsForAllergyMap[restrictionKey as keyof typeof keywordsForAllergyMap]) {
        const keywords = keywordsForAllergyMap[restrictionKey as keyof typeof keywordsForAllergyMap]!;
        if (keywords.some(keyword => recipeText.includes(keyword))) {
          allergensFound.push(commonDietaryRestrictions[restrictionKey as keyof typeof commonDietaryRestrictions] || restrictionKey);
        }
      } else if (restrictionKey === 'other' && typeof isActiveOrOther === 'string' && isActiveOrOther.trim() !== "") {
          const otherRestrictions = isActiveOrOther.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
          otherRestrictions.forEach(otherKeyword => {
              if (recipeText.includes(otherKeyword)) {
                  allergensFound.push(otherKeyword.charAt(0).toUpperCase() + otherKeyword.slice(1));
              }
          });
      }
    });
    return [...new Set(allergensFound)]; 
  }, [userDietaryRestrictions]);


  return (
    <div className="mt-8 space-y-6">
      {/* This Card is what will be cloned for PDF generation */}
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
              <AccordionItem value={`day-${dayIndex}`} key={`day-${dayIndex}`} data-radix-accordion-item>
                <AccordionTrigger className="text-lg font-semibold hover:text-accent" data-radix-accordion-trigger>
                  {dailyPlan.day}
                  {dailyPlan.estimatedCalories && (
                     <span className="text-sm font-normal text-muted-foreground ml-2 flex items-center">
                       (~{dailyPlan.estimatedCalories} kcal
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild><Info className="inline h-3 w-3 ml-1 text-muted-foreground cursor-help" /></TooltipTrigger>
                            <TooltipContent><p>Calories are estimates. Actual values may vary based on ingredients and portions.</p></TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                       )
                     </span>
                  )}
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pl-2" data-radix-accordion-content>
                  {dailyPlan.meals?.map((meal, mealIndex) => {
                    const mealId = generateMealId(dayIndex, mealIndex, meal);
                    const currentServings = recipeServings[mealId] || meal.servings || 1;
                    const isFav = favoriteRecipes.includes(mealId);
                    const allergens = checkForAllergens(meal);
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
                          <Heart className={cn("h-5 w-5 lucide-heart", isFav && "fill-current")} />
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
                        {(meal.prepTime || meal.cookTime) && (
                          <p className="text-xs text-muted-foreground mb-1.5 flex items-center">
                            <Clock3 className="h-3.5 w-3.5 mr-1.5" />
                            {meal.prepTime && <span>Prep: {meal.prepTime}</span>}
                            {meal.prepTime && meal.cookTime && <span className="mx-1">|</span>}
                            {meal.cookTime && <span>Cook: {meal.cookTime}</span>}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-1">{meal.recipe}</p>
                        {allergens.length > 0 && (
                          <div className="mt-2 mb-1 p-1.5 bg-destructive/10 border border-destructive/30 rounded-md">
                            <p className="text-xs font-medium text-destructive flex items-center">
                              <AlertTriangle className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                              Potential: Contains {allergens.join(', ')}
                            </p>
                          </div>
                        )}
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
                        {dailyPlan.estimatedProtein && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild><span className="cursor-help"> Protein: {dailyPlan.estimatedProtein}</span></TooltipTrigger>
                              <TooltipContent><p>Protein helps build and repair tissues, supports immune function, and more.</p></TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {dailyPlan.estimatedCarbs && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild><span className="cursor-help">, Carbs: {dailyPlan.estimatedCarbs}</span></TooltipTrigger>
                              <TooltipContent><p>Carbohydrates are the body's main source of energy.</p></TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {dailyPlan.estimatedFats && (
                           <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild><span className="cursor-help">, Fats: {dailyPlan.estimatedFats}</span></TooltipTrigger>
                              <TooltipContent><p>Fats are essential for energy, hormone production, and nutrient absorption.</p></TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
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

