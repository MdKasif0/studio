
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
import type { AIPersona } from '@/lib/authLocalStorage'; // Import AIPersona type

// Define a schema for chat history messages
const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model', 'system']), 
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
  persona: z.enum(["Friendly Coach", "Professional Nutritionist", "Playful Chef"]).optional().describe("The selected AI persona for the chat."),
  apiKey: z.string().optional().describe('Optional user-provided Google AI API key.'),
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
function buildChatPrompt(input: Omit<NutritionChatbotInput, 'apiKey'>): string {
  let personaDescription = "You are Nutri AI, a friendly, empathetic, and knowledgeable virtual nutrition assistant.";
  if (input.persona === "Professional Nutritionist") {
    personaDescription = "You are Nutri AI, a highly professional and evidence-based virtual nutritionist. Provide detailed, scientific, and precise information.";
  } else if (input.persona === "Playful Chef") {
    personaDescription = "You are Nutri AI, a fun, creative, and playful virtual chef! Make nutrition exciting with engaging language, food puns, and enthusiastic recipe ideas.";
  }
  
  let fullPrompt = `${personaDescription} Your primary goal is to provide comprehensive support to users of the Nutri AI app. This includes:

- Answering nutrition-related questions with evidence-based information (adjusting depth based on persona).
- Guiding users on how to effectively use all features of the Nutri AI app (e.g., Dietary Analysis, Meal Plan Generator, Recipe Alternatives, Challenges, Community Hub, Progress Tracking, Educational Resources).
- Assisting with common app usage queries or clarifying feature functionalities. If a query is too technical or requires administrative access, politely state your limitations and suggest checking a FAQ if available or contacting support (if such a channel exists).
- Providing daily encouragement, motivation, and actionable tips to help them achieve their health goals.
- If a user asks about topics beyond your scope (e.g., complex medical conditions, specific medical diagnoses) or requests direct medical advice, gently guide them to consult a qualified healthcare professional or a registered dietitian. You can also inform them that "Nutri AI plans to offer premium support options in the future, which may include access to expert consultations."

Current User Profile (if available):
${input.userProfile?.healthGoals ? `- Health Goals: ${input.userProfile.healthGoals}` : ''}
${input.userProfile?.restrictions ? `- Dietary Restrictions: ${input.userProfile.restrictions}` : ''}
${input.userProfile?.preferences ? `- Food Preferences: ${input.userProfile.preferences}` : ''}

Conversation History:
`;

  if (input.history) {
    input.history.forEach(msg => {
      if (msg.role !== 'system') { // Exclude system messages from history shown to AI
        fullPrompt += `${msg.role === 'user' ? 'User' : 'Nutri AI'}: ${msg.content}\n`;
      }
    });
  }
  fullPrompt += `User: ${input.message}\nNutri AI:`;
  return fullPrompt;
}


const prompt = ai.definePrompt({
  name: 'nutritionChatbotPrompt',
  input: {schema: NutritionChatbotInputSchema.omit({ apiKey: true }) }, 
  output: {schema: NutritionChatbotOutputSchema},
  prompt: buildChatPrompt, 
  config: { 
    temperature: 0.7, // Default, can be adjusted based on persona later if needed
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
    const { apiKey, ...promptInput } = input;
    
    // Adjust temperature based on persona if desired
    let temperature = 0.7;
    if (input.persona === "Professional Nutritionist") temperature = 0.4;
    if (input.persona === "Playful Chef") temperature = 0.8;

    const options = { 
      config: { 
        ...(apiKey && { apiKey }),
        temperature,
      } 
    };
    
    const llmResponse = await prompt(promptInput, options);
    const output = llmResponse.output;

    if (!output) {
      return { reply: "I'm having a little trouble understanding that. Could you try rephrasing?" };
    }
    
    let generatedSuggestions: string[] = [];
    // Suggestion generation logic (can also be persona-dependent)
    const lowerReply = output.reply.toLowerCase();
    if (lowerReply.includes("water") || lowerReply.includes("hydrate")) {
        generatedSuggestions.push("Track my water intake today?");
    }
    if (lowerReply.includes("meal plan") || lowerReply.includes("recipe")) {
        generatedSuggestions.push("Generate a new meal idea?");
        if (input.persona === "Playful Chef") generatedSuggestions.push("Whip up something adventurous!");
    }
     if (lowerReply.includes("feature") || lowerReply.includes("how to")) {
        generatedSuggestions.push("Tell me more about Dietary Analysis.");
        generatedSuggestions.push("How do I create a family meal plan?");
    }
     if (generatedSuggestions.length === 0 && Math.random() > 0.5) { 
        generatedSuggestions.push("What are common protein sources?");
    }
    if (generatedSuggestions.length > 3) generatedSuggestions = generatedSuggestions.slice(0,3); // Limit suggestions


    return {
      reply: output.reply,
      suggestions: output.suggestions || generatedSuggestions.length > 0 ? generatedSuggestions : undefined,
    };
  }
);
