
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { GenerateCustomMealPlanInput } from "@/ai/flows/generate-custom-meal-plan";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  dietaryRestrictions: z.string().optional(),
  preferredIngredients: z.string().optional(),
  calorieIntake: z.coerce
    .number({ invalid_type_error: "Calorie intake must be a number." })
    .min(500, { message: "Calorie intake must be at least 500." })
    .max(10000, { message: "Calorie intake seems too high." }),
  numberOfMeals: z.coerce
    .number({ invalid_type_error: "Number of meals must be a number." })
    .min(1, { message: "Must plan at least 1 meal." })
    .max(7, { message: "Cannot plan more than 7 meals." }),
});

type MealPlanFormValues = z.infer<typeof formSchema>;

interface MealPlanFormProps {
  onSubmit: (data: GenerateCustomMealPlanInput) => Promise<void>;
  isPending: boolean;
}

export function MealPlanForm({ onSubmit, isPending }: MealPlanFormProps) {
  const form = useForm<MealPlanFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dietaryRestrictions: "",
      preferredIngredients: "",
      calorieIntake: 2000,
      numberOfMeals: 3,
    },
  });

  const handleSubmit = (values: MealPlanFormValues) => {
    const inputData: GenerateCustomMealPlanInput = {
      dietaryRestrictions: values.dietaryRestrictions || "None",
      preferredIngredients: values.preferredIngredients || "None",
      calorieIntake: values.calorieIntake,
      numberOfMeals: values.numberOfMeals,
    };
    onSubmit(inputData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="dietaryRestrictions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dietary Restrictions (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Vegan, gluten-free, low-carb..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="preferredIngredients"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Ingredients (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Chicken breast, broccoli, quinoa, salmon..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="calorieIntake"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Daily Calorie Intake</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 2000" {...field} />
                </FormControl>
                <FormDescription>Enter your desired daily calories.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="numberOfMeals"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Meals Per Day</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 3" {...field} />
                </FormControl>
                <FormDescription>How many meals to plan for (e.g., 3 for breakfast, lunch, dinner).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Plan...
            </>
          ) : (
            "Generate Meal Plan"
          )}
        </Button>
      </form>
    </Form>
  );
}
