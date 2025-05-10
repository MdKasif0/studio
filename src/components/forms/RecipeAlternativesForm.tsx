
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
import type { SuggestRecipeAlternativesInput } from "@/ai/flows/suggest-recipe-alternatives";
import { Loader2, Lightbulb } from "lucide-react"; // Added Lightbulb

const formSchema = z.object({
  recipeName: z
    .string()
    .min(3, { message: "Recipe name must be at least 3 characters." }),
  ingredients: z
    .string()
    .min(10, { message: "Ingredients list must be at least 10 characters." }),
  dietaryRestrictions: z.string().optional(),
});

type RecipeAlternativesFormValues = z.infer<typeof formSchema>;

interface RecipeAlternativesFormProps {
  onSubmit: (data: SuggestRecipeAlternativesInput) => Promise<void>;
  isPending: boolean;
}

export function RecipeAlternativesForm({ onSubmit, isPending }: RecipeAlternativesFormProps) {
  const form = useForm<RecipeAlternativesFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipeName: "",
      ingredients: "",
      dietaryRestrictions: "",
    },
  });

  const handleSubmit = (values: RecipeAlternativesFormValues) => {
     const inputData: SuggestRecipeAlternativesInput = {
      recipeName: values.recipeName,
      ingredients: values.ingredients,
      dietaryRestrictions: values.dietaryRestrictions || "None",
    };
    onSubmit(inputData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="recipeName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Original Recipe Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Classic Lasagna" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="ingredients"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Original Ingredients</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="List the ingredients of the original recipe, e.g., Ground beef, pasta sheets, tomato sauce, cheese..."
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dietaryRestrictions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dietary Restrictions for Alternatives (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Dairy-free, vegetarian, low-sodium..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Specify any restrictions the alternatives should meet.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
           {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Finding smart alternatives...
            </>
          ) : (
            <>
            <Lightbulb className="mr-2 h-4 w-4" />
            Suggest Alternatives
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}

