
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
import {
  suggestTodaysLunch,
  type SuggestTodaysLunchInput,
  type SuggestTodaysLunchOutput,
} from "@/ai/flows/suggest-todays-lunch-flow";
import {
  generateQuickShoppingList,
  type GenerateQuickShoppingListInput,
  type GenerateQuickShoppingListOutput,
} from "@/ai/flows/generate-quick-shopping-list-flow";
import {
  generateProgressSnapshotMessage,
  type GenerateProgressSnapshotMessageInput,
  type GenerateProgressSnapshotMessageOutput,
} from "@/ai/flows/generate-progress-snapshot-message-flow";

import type { AccountSettingsFormData, ChangePasswordFormData, LoginFormData, SignUpFormData } from "@/lib/schemas/authSchemas";
import type { SymptomLogFormValues } from "@/lib/schemas/appSchemas";


export async function handleDietaryAnalysis(
  data: AnalyzeDietaryHabitsInput
): Promise<AnalyzeDietaryHabitsOutput> {
  console.log("Server Action: handleDietaryAnalysis called with", data);
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
    throw new Error(`Oops! We couldn't analyze your diet right now. ${errorMessage}. Please check your input or try again in a moment.`);
  }
}

export async function handleMealPlanGeneration(
  data: GenerateCustomMealPlanInput
): Promise<GenerateCustomMealPlanOutput> {
  console.log("Server Action: handleMealPlanGeneration called with", data);
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
    throw new Error(`Hmm, we're having trouble crafting your meal plan. ${errorMessage}. Please ensure all details are correct or try again later.`);
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
    throw new Error(`Looks like we couldn't find alternatives for that recipe. ${errorMessage}. Please check the details or try a different one.`);
  }
}

export async function handleChatbotInteraction(
  data: NutritionChatbotInput
): Promise<NutritionChatbotOutput> {
  console.log("Server Action: handleChatbotInteraction called with", data.message);
  try {
     if (data.message.toLowerCase().includes("trigger error")) {
        throw new Error("Simulated AI error in chatbot.");
    }
    const result = await nutritionChatbot(data);
    return result;
  } catch (error) {
    console.error("Error in handleChatbotInteraction:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    throw new Error(`My circuits are a bit tangled! I couldn't process that. ${errorMessage}. Could you try rephrasing or ask something else?`);
  }
}


export async function handleLogin(data: LoginFormData): Promise<{ success: boolean; message: string; user?: { username: string; email: string, id: string } }> {
  console.log("Server Action: handleLogin called with", data);
  await new Promise(resolve => setTimeout(resolve, 1000)); 

  const inputUsernameOrEmail = data.usernameOrEmail.toLowerCase();
  const testUsername = "testuser";
  const testEmail = "testuser@example.com";

  try {
    if ((inputUsernameOrEmail === testUsername || inputUsernameOrEmail === testEmail) && data.password === "Password123!") {
      return { success: true, message: "Login successful!", user: { id: "user123", username: "testuser", email: "testuser@example.com" } };
    } else if (inputUsernameOrEmail === "error@example.com") {
      throw new Error("Simulated server error during login.");
    } else {
      return { success: false, message: "Invalid username or password." };
    }
  } catch (error) {
     console.error("Server-side login error:", error);
     throw new Error("Our server seems to be having a moment. Please try logging in again shortly.");
  }
}

export async function handleSignUp(data: SignUpFormData): Promise<{ success: boolean; message: string; user?: { username: string; email: string, id: string } }> {
  console.log("Server Action: handleSignUp called with", data);
  await new Promise(resolve => setTimeout(resolve, 1500));

  try {
    if (data.email === "exists@example.com") {
      return { success: false, message: "Email already exists." };
    }
    if (data.username === "takenuser") {
      return { success: false, message: "Username is already taken." };
    }
    // Simulate successful signup
    const newUserId = "user" + Date.now(); 
    return { 
      success: true, 
      message: "Account created successfully! Please complete your profile.", 
      user: { id: newUserId, username: data.username, email: data.email } 
    };
  } catch (error) {
      console.error("Server-side sign-up error:", error);
      throw new Error("We hit a snag creating your account. Please try again.");
  }
}


export async function handleAccountUpdate(data: AccountSettingsFormData): Promise<{ success: boolean; message: string }> {
  console.log("Server Action: handleAccountUpdate called with data:", data);
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  try {
    if (data.username === "erroruser") {
        return { success: false, message: "That username isn't available. Please choose a different one." };
    }
    // In a real app, update user in database here
    console.log("Account update simulated successfully for user:", data.username);
    return { success: true, message: "Account updated successfully." };
  } catch (error) {
    console.error("Server-side account update error:", error);
    return { success: false, message: "Our servers stumbled a bit. Could you try saving your profile again?" };
  }
}


export async function handleChangePasswordAction(data: ChangePasswordFormData): Promise<{ success: boolean; message: string }> {
  console.log("Server Action: handleChangePasswordAction called");
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    if (data.currentPassword === "wrongpassword") {
        return { success: false, message: "Incorrect current password." };
    }
    if (data.newPassword.length < 8) { 
        return { success: false, message: "New password is too short (server validation)." };
    }
    console.log("Password change simulated successfully.");
    return { success: true, message: "Password changed successfully." };
  } catch (error) {
      console.error("Server-side password change error:", error);
      return { success: false, message: "A glitch in the matrix! Password change failed. Please try once more." };
  }
}

export async function handleDeleteAccountAction(): Promise<{ success: boolean; message: string }> {
  console.log("Server Action: handleDeleteAccountAction called");
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  try {
    console.log("Account deletion simulated successfully.");
    return { success: true, message: "Account deleted successfully." };
  } catch (error) {
    console.error("Server-side account deletion error:", error);
    return { success: false, message: "Something went wrong on our end. Please try deleting your account again." };
  }
}

export async function handleLogSymptom(data: SymptomLogFormValues): Promise<{ success: boolean; message: string }> {
  console.log("Server Action: handleLogSymptom called with data:", data);
  await new Promise(resolve => setTimeout(resolve, 800));

  try {
    if (data.mealName.toLowerCase().includes("trigger error")) {
      return { success: false, message: "Oh no! We couldn't save your symptom log due to a simulated issue. Please try again." };
    }
    console.log("Symptom log simulated successfully for meal:", data.mealName);
    return { success: true, message: "Symptoms logged successfully." };
  } catch (error) {
    console.error("Server-side symptom log error:", error);
    return { success: false, message: "Yikes! We couldn't record your symptoms right now. Please try again." };
  }
}

export async function handleSuggestTodaysLunch(
  data: SuggestTodaysLunchInput
): Promise<SuggestTodaysLunchOutput> {
  console.log("Server Action: handleSuggestTodaysLunch called with", data);
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const result = await suggestTodaysLunch(data);
    return result;
  } catch (error) {
    console.error("Error in handleSuggestTodaysLunch:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    throw new Error(`I'm drawing a blank on lunch ideas right now! ${errorMessage}. Please try again in a bit.`);
  }
}

export async function handleGenerateQuickShoppingList(
  data: GenerateQuickShoppingListInput
): Promise<GenerateQuickShoppingListOutput> {
  console.log("Server Action: handleGenerateQuickShoppingList called with", data);
  try {
    await new Promise(resolve => setTimeout(resolve, 800));
    const result = await generateQuickShoppingList(data);
    return result;
  } catch (error) {
    console.error("Error in handleGenerateQuickShoppingList:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    throw new Error(`Can't quite remember what's in the pantry! ${errorMessage}. Please try generating the list again.`);
  }
}

export async function handleGenerateProgressMessage(
  data: GenerateProgressSnapshotMessageInput
): Promise<GenerateProgressSnapshotMessageOutput> {
  console.log("Server Action: handleGenerateProgressMessage called with", data);
  try {
    await new Promise(resolve => setTimeout(resolve, 600));
    const result = await generateProgressSnapshotMessage(data);
    return result;
  } catch (error) {
    console.error("Error in handleGenerateProgressMessage:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    throw new Error(`Hmm, couldn't fetch your progress cheer-up. ${errorMessage}. We'll try again next time!`);
  }
}

