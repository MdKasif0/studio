
"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { MealPlanForm } from "@/components/forms/MealPlanForm";
import { MealPlanDisplay } from "@/components/display/MealPlanDisplay";
import { handleMealPlanGeneration } from "@/lib/actions";
import type {
  GenerateCustomMealPlanInput,
  GenerateCustomMealPlanOutput,
} from "@/ai/flows/generate-custom-meal-plan";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


export default function MealPlanPage() {
  const { toast } = useToast();
  const [mealPlanResult, setMealPlanResult] = useState<GenerateCustomMealPlanOutput | null>(null);

  const mutation = useMutation({
    mutationFn: (data: GenerateCustomMealPlanInput) => handleMealPlanGeneration(data),
    onSuccess: (data) => {
      setMealPlanResult(data);
      toast({
        title: "Meal Plan Generated!",
        description: "Your custom meal plan is ready.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Meal Plan Generation Failed",
        description: error.message || "An unexpected error occurred.",
      });
      setMealPlanResult(null);
    },
  });

  const handleSubmit = async (data: GenerateCustomMealPlanInput) => {
    mutation.mutate(data);
  };

  return (
    <div className="container mx-auto w-full md:max-w-3xl py-2 md:py-8"> {/* Adjusted padding and width */}
      <Card className="shadow-xl">
        <CardHeader className="px-4 pt-4 md:px-6 md:pt-6">
          <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight">Custom Meal Plan Generator</CardTitle>
          <CardDescription className="text-muted-foreground text-sm md:text-base">
            Tell us your needs, and our AI will craft a personalized meal plan for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
          <MealPlanForm
            onSubmit={handleSubmit}
            isPending={mutation.isPending}
          />
          {mutation.isError && (
             <Alert variant="destructive" className="mt-6 md:mt-8">
             <Terminal className="h-4 w-4" />
             <AlertTitle>Error</AlertTitle>
             <AlertDescription>
                {mutation.error instanceof Error ? mutation.error.message : "An unknown error occurred."}
             </AlertDescription>
           </Alert>
          )}
          {mealPlanResult && <MealPlanDisplay data={mealPlanResult} />}
        </CardContent>
      </Card>
    </div>
  );
}
