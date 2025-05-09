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


export async function handleDietaryAnalysis(
  data: AnalyzeDietaryHabitsInput
): Promise<AnalyzeDietaryHabitsOutput> {
  console.log("Server Action: handleDietaryAnalysis called with", data);
  try {
    // Simulate a short delay for network
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Example of how to trigger a simulated error for testing
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
  data: GenerateCustomMealPlanInput
): Promise<GenerateCustomMealPlanOutput> {
  console.log("Server Action: handleMealPlanGeneration called with", data);
  try {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate longer delay
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
  data: SuggestRecipeAlternativesInput
): Promise<SuggestRecipeAlternativesOutput> {
  console.log("Server Action: handleRecipeSuggestion called with", data);
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
  data: NutritionChatbotInput
): Promise<NutritionChatbotOutput> {
  console.log("Server Action: handleChatbotInteraction called with", data.message);
  try {
    // Note: Genkit flows might have their own internal delays.
    // Adding a small artificial delay here if needed for testing UI, but usually not necessary.
    // await new Promise(resolve => setTimeout(resolve, 500));
     if (data.message.toLowerCase().includes("trigger error")) {
        throw new Error("Simulated AI error in chatbot.");
    }
    const result = await nutritionChatbot(data);
    return result;
  } catch (error) {
    console.error("Error in handleChatbotInteraction:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    // For chatbot, we might want to return a structured error response rather than throwing
    // if the flow itself can handle it. But for unhandled exceptions, throwing is fine.
    throw new Error(`Chatbot interaction failed: ${errorMessage}. Please try again.`);
  }
}


export async function handleLogin(data: LoginFormData): Promise<{ success: boolean; message: string; user?: { username: string; email: string, id: string } }> {
  console.log("Server Action: handleLogin called with", data);
  await new Promise(resolve => setTimeout(resolve, 1000)); 

  const inputUsernameOrEmail = data.usernameOrEmail.toLowerCase();
  const testUsername = "testuser";
  const testEmail = "testuser@example.com";

  // Simulate database check / Firebase Auth
  if ((inputUsernameOrEmail === testUsername || inputUsernameOrEmail === testEmail) && data.password === "Password123!") {
    return { success: true, message: "Login successful!", user: { id: "user123", username: "testuser", email: "testuser@example.com" } };
  } else if (inputUsernameOrEmail === "error@example.com") {
    return { success: false, message: "Simulated server error during login." };
  } else {
    return { success: false, message: "Invalid username or password." };
  }
}

export async function handleSignUp(data: SignUpFormData): Promise<{ success: boolean; message: string; user?: { username: string; email: string, id: string } }> {
  console.log("Server Action: handleSignUp called with", data);
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Simulate database check / Firebase Auth
  if (data.email === "exists@example.com") {
    return { success: false, message: "Email already exists." };
  }
  if (data.username === "takenuser") {
    return { success: false, message: "Username is already taken." };
  }
  // Simulate successful signup
  const newUserId = "user" + Date.now();
  return { success: true, message: "Account created successfully! You are now logged in.", user: { id: newUserId, username: data.username, email: data.email } };
}


export async function handleAccountUpdate(data: AccountSettingsFormData): Promise<{ success: boolean; message: string }> {
  console.log("Server Action: handleAccountUpdate called with data:", data);
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (data.username === "erroruser") {
     return { success: false, message: "Simulated error: Username 'erroruser' cannot be used." };
  }
  // In a real app, update user in database here
  console.log("Account update simulated successfully for user:", data.username);
  return { success: true, message: "Account updated successfully." };
}


export async function handleChangePasswordAction(data: ChangePasswordFormData): Promise<{ success: boolean; message: string }> {
  console.log("Server Action: handleChangePasswordAction called");
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (data.currentPassword === "wrongpassword") {
     return { success: false, message: "Incorrect current password." };
  }
  if (data.newPassword.length < 8) { // Example server-side validation
      return { success: false, message: "New password is too short (server validation)." };
  }
  // In a real app: 1. Verify currentPassword, 2. Hash newPassword, 3. Update password in DB
  console.log("Password change simulated successfully.");
  return { success: true, message: "Password changed successfully." };
}

export async function handleDeleteAccountAction(): Promise<{ success: boolean; message: string }> {
  // In a real app, you'd need the userId, typically from session/auth context
  console.log("Server Action: handleDeleteAccountAction called");
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simulate deletion logic
  // if (userId === 'protectedUser') return { success: false, message: "This account cannot be deleted (simulation)." };
  
  console.log("Account deletion simulated successfully.");
  return { success: true, message: "Account deleted successfully." };
}

export async function handleLogSymptom(data: SymptomLogFormValues): Promise<{ success: boolean; message: string }> {
  console.log("Server Action: handleLogSymptom called with data:", data);
  await new Promise(resolve => setTimeout(resolve, 800));

  if (data.mealName.toLowerCase().includes("trigger error")) {
    return { success: false, message: "Simulated error logging symptoms." };
  }
  // In a real app, save symptom log to database here
  console.log("Symptom log simulated successfully for meal:", data.mealName);
  return { success: true, message: "Symptoms logged successfully." };
}

// Placeholder for future actions (Challenges, Community, etc.)
// These would typically involve database interactions.
// export async function fetchChallenges(): Promise<any[]> {
//   console.log("Server Action: fetchChallenges called");
//   await new Promise(resolve => setTimeout(resolve, 1000));
//   // Simulate fetching from DB
//   return [{ id: 1, title: "Dynamic Challenge 1", description: "Fetched from server" }];
// }

// export async function submitCommunityPost(postData: any): Promise<{success: boolean, message: string}> {
//    console.log("Server Action: submitCommunityPost", postData);
//    await new Promise(resolve => setTimeout(resolve, 1000));
//    return {success: true, message: "Post submitted (simulated)!"};
// }