
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
import {
  nutritionChatbot,
  type NutritionChatbotInput,
  type NutritionChatbotOutput,
} from "@/ai/flows/nutrition-chatbot-flow";
import type { AccountSettingsFormData, ChangePasswordFormData } from "@/lib/schemas/authSchemas";


export async function handleDietaryAnalysis(
  data: AnalyzeDietaryHabitsInput
): Promise<AnalyzeDietaryHabitsOutput> {
  try {
    const result = await analyzeDietaryHabits(data);
    return result;
  } catch (error) {
    console.error("Error in handleDietaryAnalysis:", error);
    // Check if error is an instance of Error to access message property safely
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    throw new Error(`Failed to analyze dietary habits: ${errorMessage}. Please try again.`);
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
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    throw new Error(`Failed to generate meal plan: ${errorMessage}. Please try again.`);
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
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    throw new Error(`Failed to suggest recipe alternatives: ${errorMessage}. Please try again.`);
  }
}

export async function handleChatbotInteraction(
  data: NutritionChatbotInput
): Promise<NutritionChatbotOutput> {
  try {
    const result = await nutritionChatbot(data);
    return result;
  } catch (error) {
    console.error("Error in handleChatbotInteraction:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    throw new Error(`Chatbot interaction failed: ${errorMessage}. Please try again.`);
  }
}

// Placeholder for account update
export async function handleAccountUpdate(data: AccountSettingsFormData): Promise<{ success: boolean; message: string }> {
  console.log("Attempting to update account with data:", data);
  // Simulate API call and database update
  await new Promise(resolve => setTimeout(resolve, 1000));
  // In a real app, you would:
  // 1. Validate data server-side
  // 2. Update user in database
  // 3. Handle errors
  console.log("Account update simulated successfully for user:", data.username);
  return { success: true, message: "Account updated successfully (simulation)." };
}

// Placeholder for password change
export async function handleChangePasswordAction(data: ChangePasswordFormData): Promise<{ success: boolean; message: string }> {
  console.log("Attempting to change password for:", data);
  // Simulate API call
  // 1. Verify currentPassword
  // 2. Hash newPassword
  // 3. Update password in database
  await new Promise(resolve => setTimeout(resolve, 1000));
  if (data.currentPassword === "wrongpassword") {
     return { success: false, message: "Incorrect current password (simulation)." };
  }
  console.log("Password change simulated successfully.");
  return { success: true, message: "Password changed successfully (simulation)." };
}


// Placeholder for future symptom logging action
// export async function handleSymptomLogging(data: SymptomLogInput): Promise<SymptomLogOutput> {
//   // ...
// }
