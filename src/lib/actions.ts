
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
import type { AccountSettingsFormData, ChangePasswordFormData, LoginFormData, SignUpFormData } from "@/lib/schemas/authSchemas";
import type { SymptomLogFormValues } from "@/lib/schemas/appSchemas";
import { homeDashboardFlow, type HomeDashboardInput, type HomeDashboardOutput } from "@/ai/flows/home-dashboard-flow";


export async function handleDietaryAnalysis(
  data: AnalyzeDietaryHabitsInput // This now includes optional apiKey
): Promise<AnalyzeDietaryHabitsOutput> {
  console.log("Server Action: handleDietaryAnalysis called with habits:", data.dietaryHabits, "API Key provided:", !!data.apiKey);
  try {
    await new Promise(resolve => setTimeout(resolve, 1500));
    if (data.dietaryHabits.toLowerCase().includes("trigger error")) {
      throw new Error("Simulated AI error during dietary analysis.");
    }
    const result = await analyzeDietaryHabits(data);
    return result;
  } catch (error) {
    console.error("Error in handleDietaryAnalysis:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    throw new Error(`Failed to analyze dietary habits: ${errorMessage}. Please try again.`);
  }
}

export async function handleMealPlanGeneration(
  data: GenerateCustomMealPlanInput // This now includes optional apiKey
): Promise<GenerateCustomMealPlanOutput> {
  console.log("Server Action: handleMealPlanGeneration called with calorie intake:", data.calorieIntake, "API Key provided:", !!data.apiKey);
  try {
    await new Promise(resolve => setTimeout(resolve, 2000)); 
     if (data.calorieIntake === 0) {
      throw new Error("Simulated AI error: Calorie intake cannot be zero.");
    }
    const result = await generateCustomMealPlan(data);
    return result;
  } catch (error) {
    console.error("Error in handleMealPlanGeneration:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    throw new Error(`Failed to generate meal plan: ${errorMessage}. Please try again.`);
  }
}

export async function handleRecipeSuggestion(
  data: SuggestRecipeAlternativesInput // This now includes optional apiKey
): Promise<SuggestRecipeAlternativesOutput> {
  console.log("Server Action: handleRecipeSuggestion called with recipe:", data.recipeName, "API Key provided:", !!data.apiKey);
  try {
    await new Promise(resolve => setTimeout(resolve, 1200));
    if (data.recipeName.toLowerCase().includes("trigger error")) {
        throw new Error("Simulated AI error during recipe suggestion.");
    }
    const result = await suggestRecipeAlternatives(data);
    return result;
  } catch (error) {
    console.error("Error in handleRecipeSuggestion:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    throw new Error(`Failed to suggest recipe alternatives: ${errorMessage}. Please try again.`);
  }
}

export async function handleChatbotInteraction(
  data: NutritionChatbotInput // This now includes optional apiKey
): Promise<NutritionChatbotOutput> {
  console.log("Server Action: handleChatbotInteraction called with message:", data.message, "API Key provided:", !!data.apiKey);
  try {
     if (data.message.toLowerCase().includes("trigger error")) {
        throw new Error("Simulated AI error in chatbot.");
    }
    const result = await nutritionChatbot(data);
    return result;
  } catch (error) {
    console.error("Error in handleChatbotInteraction:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    throw new Error(`Chatbot interaction failed: ${errorMessage}. Please try again.`);
  }
}

export async function handleHomeDashboardUpdate(
  data: HomeDashboardInput // This includes optional apiKey
): Promise<HomeDashboardOutput> {
  console.log("Server Action: handleHomeDashboardUpdate called. API Key provided:", !!data.apiKey);
  try {
    const result = await homeDashboardFlow(data);
    return result;
  } catch (error) {
    console.error("Error in handleHomeDashboardUpdate:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    throw new Error(`Failed to update dashboard: ${errorMessage}. Please try again.`);
  }
}


export async function handleLogin(data: LoginFormData): Promise<{ success: boolean; message: string; user?: { username: string; email: string, id: string } }> {
  console.log("Server Action: handleLogin called with", data);
  await new Promise(resolve => setTimeout(resolve, 1000)); 

  const inputUsernameOrEmail = data.usernameOrEmail.toLowerCase();
  const testUsername = "testuser";
  const testEmail = "testuser@example.com";

  if ((inputUsernameOrEmail === testUsername || inputUsernameOrEmail === testEmail) && data.password === "Password123!") {
    return { success: true, message: "Login successful!", user: { id: "user123", username: "testuser", email: "testuser@example.com" } };
  } else if (inputUsernameOrEmail === "error@example.com") {
     return { success: false, message: "Oops! A server error occurred during login. Please try again later." };
  } else {
    return { success: false, message: "Invalid username or password. Please check your credentials and try again." };
  }
}

export async function handleSignUp(data: SignUpFormData): Promise<{ success: boolean; message: string; user?: { username: string; email: string, id: string } }> {
  console.log("Server Action: handleSignUp called with", data);
  await new Promise(resolve => setTimeout(resolve, 1500));

  if (data.email === "exists@example.com") {
    return { success: false, message: "Oops! That email address is already in use. Try another?" };
  }
  if (data.username === "takenuser") {
    return { success: false, message: "Sorry, that username is already taken. Please choose a different one." };
  }
  const newUserId = "user" + Date.now();
  return { success: true, message: "Account created successfully! You are now logged in.", user: { id: newUserId, username: data.username, email: data.email } };
}


export async function handleAccountUpdate(data: AccountSettingsFormData): Promise<{ success: boolean; message: string }> {
  console.log("Server Action: handleAccountUpdate called with data:", data);
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (data.username === "erroruser") {
     return { success: false, message: "Simulated error: Username 'erroruser' cannot be used." };
  }
  console.log("Account update simulated successfully for user:", data.username);
  return { success: true, message: "Account updated successfully." };
}


export async function handleChangePasswordAction(data: ChangePasswordFormData): Promise<{ success: boolean; message: string }> {
  console.log("Server Action: handleChangePasswordAction called");
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (data.currentPassword === "wrongpassword") {
     return { success: false, message: "Incorrect current password. Please try again." };
  }
  if (data.newPassword.length < 8) { 
      return { success: false, message: "New password is too short (minimum 8 characters required by server)." };
  }
  console.log("Password change simulated successfully.");
  return { success: true, message: "Password changed successfully." };
}

export async function handleDeleteAccountAction(): Promise<{ success: boolean; message: string }> {
  console.log("Server Action: handleDeleteAccountAction called");
  await new Promise(resolve => setTimeout(resolve, 1500));
  console.log("Account deletion simulated successfully.");
  return { success: true, message: "Account deleted successfully." };
}

export async function handleLogSymptom(data: SymptomLogFormValues): Promise<{ success: boolean; message: string }> {
  console.log("Server Action: handleLogSymptom called with data:", data);
  await new Promise(resolve => setTimeout(resolve, 800));

  if (data.mealName.toLowerCase().includes("trigger error")) {
    return { success: false, message: "Simulated error logging symptoms. Please try again." };
  }
  console.log("Symptom log simulated successfully for meal:", data.mealName);
  return { success: true, message: "Symptoms logged successfully." };
}
