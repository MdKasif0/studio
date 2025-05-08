
"use server";

import {
  analyzeDietaryHabits,
  type AnalyzeDietaryHabitsInput,
  type AnalyzeDietaryHabitsOutput,
} from "@/ai/flows/analyze-dietary-habits";
import {
  generateCustomMealPlan,
  type GenerateCustomMealPlanInput,
  type GenerateCustomMealPlanOutput,
} from "@/ai/flows/generate-custom-meal-plan";
import {
  suggestRecipeAlternatives,
  type SuggestRecipeAlternativesInput,
  type SuggestRecipeAlternativesOutput,
} from "@/ai/flows/suggest-recipe-alternatives";

export async function handleDietaryAnalysis(
  data: AnalyzeDietaryHabitsInput
): Promise<AnalyzeDietaryHabitsOutput> {
  try {
    const result = await analyzeDietaryHabits(data);
    return result;
  } catch (error) {
    console.error("Error in handleDietaryAnalysis:", error);
    throw new Error("Failed to analyze dietary habits. Please try again.");
  }
}

export async function handleMealPlanGeneration(
  data: GenerateCustomMealPlanInput
): Promise<GenerateCustomMealPlanOutput> {
  try {
    const result = await generateCustomMealPlan(data);
    return result;
  } catch (error) {
    console.error("Error in handleMealPlanGeneration:", error);
    throw new Error("Failed to generate meal plan. Please try again.");
  }
}

export async function handleRecipeSuggestion(
  data: SuggestRecipeAlternativesInput
): Promise<SuggestRecipeAlternativesOutput> {
  try {
    const result = await suggestRecipeAlternatives(data);
    return result;
  } catch (error) {
    console.error("Error in handleRecipeSuggestion:", error);
    throw new Error("Failed to suggest recipe alternatives. Please try again.");
  }
}
