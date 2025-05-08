
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
import { Textarea } from "@/components/ui/textarea";
import type { AnalyzeDietaryHabitsInput } from "@/ai/flows/analyze-dietary-habits";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  dietaryHabits: z
    .string()
    .min(10, { message: "Please describe your dietary habits in at least 10 characters." }),
  restrictions: z.string().optional(),
  preferences: z.string().optional(),
});

type DietaryAnalysisFormValues = z.infer<typeof formSchema>;

interface DietaryAnalysisFormProps {
  onSubmit: (data: AnalyzeDietaryHabitsInput) => Promise<void>;
  isPending: boolean;
}

export function DietaryAnalysisForm({ onSubmit, isPending }: DietaryAnalysisFormProps) {
  const form = useForm<DietaryAnalysisFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dietaryHabits: "",
      restrictions: "",
      preferences: "",
    },
  });

  const handleSubmit = (values: DietaryAnalysisFormValues) => {
    const inputData: AnalyzeDietaryHabitsInput = {
      dietaryHabits: values.dietaryHabits,
      restrictions: values.restrictions || "None",
      preferences: values.preferences || "None",
    };
    onSubmit(inputData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="dietaryHabits"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Dietary Habits</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., I usually eat three meals a day, often skip breakfast, consume a lot of processed foods..."
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Describe your typical eating patterns, meal timings, and common food choices.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="restrictions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dietary Restrictions or Allergies (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Gluten-free, lactose intolerant, vegetarian, allergic to nuts..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                List any foods you need to avoid or specific dietary protocols you follow.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="preferences"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Food Preferences and Dislikes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Love spicy food, prefer chicken over fish, dislike mushrooms..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Mention any strong likes or dislikes that should be considered.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Analyze My Diet"
          )}
        </Button>
      </form>
    </Form>
  );
}
