'use server';
/**
 * @fileOverview AI-driven chatbot for nutrition guidance, setup assistance, and motivation.
 *
 * - nutritionChatbot - A function that handles chatbot interactions.
 * - NutritionChatbotInput - The input type for the nutritionChatbot function.
 * - NutritionChatbotOutput - The return type for the nutritionChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define a schema for chat history messages
const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']), // 'user' for user messages, 'model' for AI responses
  content: z.string(),
});

const NutritionChatbotInputSchema = z.object({
  userId: z.string().optional().describe('Optional user identifier for personalized context in future.'),
  message: z.string().describe('The user\'s current message to the chatbot.'),
  history: z.array(ChatMessageSchema).optional().describe('The conversation history up to this point.'),
  userProfile: z.object({
      dietaryHabits: z.string().optional(),
      restrictions: z.string().optional(),
      preferences: z.string().optional(),
      healthGoals: z.string().optional(),
  }).optional().describe('Basic user profile information to personalize responses.'),
});
export type NutritionChatbotInput = z.infer<typeof NutritionChatbotInputSchema>;

const NutritionChatbotOutputSchema = z.object({
  reply: z.string().describe('The chatbot\'s response to the user\'s message.'),
  suggestions: z.array(z.string()).optional().describe('Optional follow-up questions or actions the user might take.'),
});
export type NutritionChatbotOutput = z.infer<typeof NutritionChatbotOutputSchema>;

export async function nutritionChatbot(input: NutritionChatbotInput): Promise<NutritionChatbotOutput> {
  return nutritionChatbotFlow(input);
}

// Construct the prompt string with history
function buildChatPrompt(input: NutritionChatbotInput): string {
  let fullPrompt = `You are NutriCoach AI, a friendly and knowledgeable virtual nutrition assistant. Your goal is to help users with their nutrition questions, guide them through the app, provide encouragement, and offer helpful tips.

You should be:
- Empathetic and supportive.
- Knowledgeable about general nutrition, healthy eating, and common dietary concerns.
- Able to provide brief, clear, and actionable advice.
- Encouraging and motivating.
- Aware that you are part of the "NutriCoach AI" app.

Current User Profile (if available):
${input.userProfile?.healthGoals ? `- Health Goals: ${input.userProfile.healthGoals}` : ''}
${input.userProfile?.restrictions ? `- Dietary Restrictions: ${input.userProfile.restrictions}` : ''}
${input.userProfile?.preferences ? `- Food Preferences: ${input.userProfile.preferences}` : ''}

Conversation History:
`;

  if (input.history) {
    input.history.forEach(msg => {
      fullPrompt += `${msg.role === 'user' ? 'User' : 'NutriCoach AI'}: ${msg.content}\n`;
    });
  }
  fullPrompt += `User: ${input.message}\nNutriCoach AI:`;
  return fullPrompt;
}


const prompt = ai.definePrompt({
  name: 'nutritionChatbotPrompt',
  input: {schema: NutritionChatbotInputSchema},
  output: {schema: NutritionChatbotOutputSchema},
  prompt: buildChatPrompt, // Use the dynamic prompt builder
  config: {
    // Higher temperature for more creative/varied chat responses
    temperature: 0.7,
    // Safety settings can be adjusted if needed
    safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  },
});


const nutritionChatbotFlow = ai.defineFlow(
  {
    name: 'nutritionChatbotFlow',
    inputSchema: NutritionChatbotInputSchema,
    outputSchema: NutritionChatbotOutputSchema,
  },
  async (input) => {
    // Here, we directly use the prompt definition which now internally handles the history.
    // The `prompt` function itself will call `buildChatPrompt` with the input.
    const llmResponse = await prompt(input);
    const output = llmResponse.output();

    if (!output) {
      // Fallback or error handling if the LLM doesn't return structured output as expected
      return { reply: "I'm having a little trouble understanding that. Could you try rephrasing?" };
    }
    
    // Potentially add logic here to generate suggestions based on the reply or user query.
    // For now, we'll keep it simple.
    // Example: if reply mentions hydration, suggest "Log your water intake?"
    let generatedSuggestions: string[] = [];
    if (output.reply.toLowerCase().includes("water") || output.reply.toLowerCase().includes("hydrate")) {
        generatedSuggestions.push("Track my water intake today?");
    }
    if (output.reply.toLowerCase().includes("meal") || output.reply.toLowerCase().includes("recipe")) {
        generatedSuggestions.push("Generate a new meal idea?");
    }
     if (generatedSuggestions.length === 0 && Math.random() > 0.5) { // Randomly add a generic suggestion
        generatedSuggestions.push("What are common protein sources?");
    }


    return {
      reply: output.reply,
      suggestions: output.suggestions || generatedSuggestions.length > 0 ? generatedSuggestions : undefined,
    };
  }
);
