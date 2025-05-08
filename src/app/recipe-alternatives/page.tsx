
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
import { Terminal } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="container mx-auto max-w-3xl py-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">Recipe Ingredient & Alternative Suggester</CardTitle>
          <CardDescription className="text-muted-foreground">
            Need to adapt a recipe? Enter the details below and our AI will suggest alternatives based on your dietary needs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecipeAlternativesForm
            onSubmit={handleSubmit}
            isPending={mutation.isPending}
          />
          {mutation.isError && (
            <Alert variant="destructive" className="mt-8">
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
