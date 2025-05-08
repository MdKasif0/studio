
import type { GenerateCustomMealPlanOutput } from "@/ai/flows/generate-custom-meal-plan";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MealPlanDisplayProps {
  data: GenerateCustomMealPlanOutput;
}

export function MealPlanDisplay({ data }: MealPlanDisplayProps) {
  return (
    <Card className="mt-8 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Your Custom Meal Plan</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 max-h-[70vh]"> {/* Adjusted height */}
          <div className="whitespace-pre-wrap p-1 text-card-foreground/90">
            {data.mealPlan}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
