
"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { RecipeAlternativesForm } from "@/components/forms/RecipeAlternativesForm";
import { RecipeSuggestionDisplay } from "@/components/display/RecipeSuggestionDisplay";
import { handleRecipeSuggestion } from "@/lib/actions";
import type {
  SuggestRecipeAlternativesInput,
  SuggestRecipeAlternativesOutput,
} from "@/ai/flows/suggest-recipe-alternatives";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Lightbulb } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import type { Metadata } from "next"; // Not used directly in client component

// export const metadata: Metadata = { // This won't work directly in a "use client" component.
//   title: "Recipe Alternatives & Ingredient Swaps | Nutri AI",
//   description: "Find suitable ingredient substitutions or alternative recipes that fit your dietary restrictions and preferences with Nutri AI's smart suggester.",
// };

export default function RecipeAlternativesPage() {
  const { toast } = useToast();
  const [suggestionResult, setSuggestionResult] = useState<SuggestRecipeAlternativesOutput | null>(null);

  const mutation = useMutation({
    mutationFn: (data: SuggestRecipeAlternativesInput) => handleRecipeSuggestion(data),
    onSuccess: (data) => {
      setSuggestionResult(data);
      toast({
        title: "Suggestions Ready!",
        description: "Recipe alternatives have been generated.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Suggestion Failed",
        description: error.message || "An unexpected error occurred.",
      });
      setSuggestionResult(null);
    },
  });

  const handleSubmit = async (data: SuggestRecipeAlternativesInput) => {
    mutation.mutate(data);
  };

  return (
    <div className="container mx-auto w-full md:max-w-3xl py-2 md:py-8"> {/* Adjusted padding and width */}
      <Card className="shadow-xl">
        <CardHeader className="px-4 pt-4 md:px-6 md:pt-6">
          <div className="flex items-center gap-2 md:gap-3 mb-2">
            <Lightbulb className="h-7 w-7 md:h-8 md:w-8 text-accent" />
            <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight">Recipe Ingredient & Alternative Suggester</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground text-sm md:text-base">
            Need to adapt a recipe? Enter the details below and our AI will suggest alternatives based on your dietary needs.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
          <RecipeAlternativesForm
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
          {suggestionResult && <RecipeSuggestionDisplay data={suggestionResult} />}
        </CardContent>
      </Card>
    </div>
  );
}
