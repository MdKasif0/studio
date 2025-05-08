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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  healthGoals: z.string().optional(),
  cookingTimePreference: z.string().optional(),
  cuisinePreferences: z.string().optional(),
  lifestyle: z.string().optional(),
  familyMembersDescription: z.string().optional(),
  previousPlanFeedback: z.string().optional(),
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
      healthGoals: "",
      cookingTimePreference: "no preference",
      cuisinePreferences: "",
      lifestyle: "",
      familyMembersDescription: "",
      previousPlanFeedback: "",
    },
  });

  const handleSubmit = (values: MealPlanFormValues) => {
    const inputData: GenerateCustomMealPlanInput = {
      dietaryRestrictions: values.dietaryRestrictions || "None",
      preferredIngredients: values.preferredIngredients || "None",
      calorieIntake: values.calorieIntake,
      numberOfMeals: values.numberOfMeals,
      healthGoals: values.healthGoals || "General wellness",
      cookingTimePreference: values.cookingTimePreference,
      cuisinePreferences: values.cuisinePreferences || "None",
      lifestyle: values.lifestyle || "General",
      familyMembersDescription: values.familyMembersDescription || "Planning for one adult.",
      previousPlanFeedback: values.previousPlanFeedback || "No previous feedback.",
    };
    onSubmit(inputData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="healthGoals"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Health Goals (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Weight loss, muscle gain" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="calorieIntake"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Daily Calorie Intake</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 2000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <FormField
            control={form.control}
            name="numberOfMeals"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Meals Per Day</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 3" {...field} />
                </FormControl>
                 <FormDescription>Includes main meals and optional snacks.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cookingTimePreference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cooking Time Preference</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select preferred cooking time" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="quick">Quick (under 30 mins)</SelectItem>
                    <SelectItem value="moderate">Moderate (30-60 mins)</SelectItem>
                    <SelectItem value="no preference">No Preference</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="dietaryRestrictions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dietary Restrictions (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Vegan, gluten-free, low-carb, allergies (nuts, shellfish)..."
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
              <FormLabel>Preferred/Available Ingredients (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Chicken breast, broccoli, quinoa, salmon, seasonal vegetables..."
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
          name="cuisinePreferences"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cuisine Preferences (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Italian, Mexican, Indian, Mediterranean" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lifestyle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lifestyle (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Busy professional, student, athlete, stay-at-home parent" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="familyMembersDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Family Considerations (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Planning for yourself or a family? e.g., 'Just me', 'Family of 4 (2 adults, 2 kids - 5yo, 8yo, one picky eater)', 'Me and my partner (vegetarian)'"
                  rows={2}
                  {...field}
                />
              </FormControl>
              <FormDescription>Helps tailor portions and recipe suitability if planning for multiple people.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="previousPlanFeedback"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Feedback on Previous Meal Plans (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Loved the pasta dishes, found breakfast too light, need more snack options..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>Help us improve your next meal plan!</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
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
