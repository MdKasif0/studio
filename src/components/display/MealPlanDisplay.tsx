
"use client"; // Ensure this is a client component for useRef, useState, and html2pdf.js

import type { GenerateCustomMealPlanOutput } from "@/ai/flows/generate-custom-meal-plan";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, ListChecks, ShoppingCart, UtensilsCrossed, Download, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
// Note: The user needs to install html2pdf.js: npm install html2pdf.js OR yarn add html2pdf.js
import html2pdf from 'html2pdf.js';

interface MealPlanDisplayProps {
  data: GenerateCustomMealPlanOutput;
}

export function MealPlanDisplay({ data }: MealPlanDisplayProps) {
  const mealPlanCardRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPdf = () => {
    if (!mealPlanCardRef.current) {
      console.error("Meal plan element not found for PDF generation.");
      return;
    }
    setIsGeneratingPdf(true);

    const elementToPrint = mealPlanCardRef.current;
    // Sanitize title for filename
    const safeTitle = data.mealPlanTitle ? data.mealPlanTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'custom_meal_plan';
    const pdfFilename = `${safeTitle}.pdf`;

    const opt = {
      margin: 0.5, // inches
      filename: pdfFilename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false }, // logging: false to reduce console noise
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] } // Better page breaking
    };

    html2pdf().from(elementToPrint).set(opt).save()
      .then(() => {
        setIsGeneratingPdf(false);
      })
      .catch((err: Error) => {
        console.error("Error generating PDF:", err);
        setIsGeneratingPdf(false);
        // Optionally, add a toast notification for the error
        // toast({ variant: "destructive", title: "PDF Error", description: "Could not generate PDF." });
      });
  };

  return (
    <div className="mt-8 space-y-6">
      <Card className="shadow-lg" data-ai-hint="cache results meal plan" ref={mealPlanCardRef}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl text-primary">{data.mealPlanTitle || "Your Custom Meal Plan"}</CardTitle>
              <CardDescription>Here's a personalized plan crafted just for you.</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              aria-label="Download meal plan as PDF"
              className="ml-4 shrink-0" // Added margin-left for spacing
            >
              {isGeneratingPdf ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {isGeneratingPdf ? "Generating..." : "Download PDF"}
            </Button>
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
