import type { GenerateCustomMealPlanOutput } from "@/ai/flows/generate-custom-meal-plan";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, ListChecks, ShoppingCart, UtensilsCrossed } from "lucide-react";

interface MealPlanDisplayProps {
  data: GenerateCustomMealPlanOutput;
}

export function MealPlanDisplay({ data }: MealPlanDisplayProps) {
  return (
    <div className="mt-8 space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">{data.mealPlanTitle || "Your Custom Meal Plan"}</CardTitle>
          <CardDescription>Here's a personalized plan crafted just for you.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
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
                  {dailyPlan.meals?.map((meal, mealIndex) => (
                    <div key={`meal-${dayIndex}-${mealIndex}`} className="p-3 rounded-md border border-border/70 bg-card/50">
                      <h4 className="font-medium text-md text-primary-foreground bg-primary rounded-t-md px-3 py-1 -mx-3 -mt-3 mb-2">{meal.name}: {meal.dish}</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-1">{meal.recipe}</p>
                      {meal.notes && <p className="text-xs text-muted-foreground/80 italic">Note: {meal.notes}</p>}
                    </div>
                  ))}
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
        <Card className="shadow-lg">
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
        <Card className="shadow-lg">
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
