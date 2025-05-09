
// This is an AI-powered personalized nutrition coach (Nutri AI) that analyzes dietary habits and restrictions, creating custom meal plans and recipe suggestions tailored to individual needs.
'use server';
/**
 * @fileOverview Analyzes dietary habits, restrictions, preferences, and health goals to provide personalized insights and recommendations.
 *
 * - analyzeDietaryHabits - A function that handles the analysis of dietary habits.
 * - AnalyzeDietaryHabitsInput - The input type for the analyzeDietaryHabits function.
 * - AnalyzeDietaryHabitsOutput - The return type for the analyzeDietaryHabits function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeDietaryHabitsInputSchema = z.object({
  dietaryHabits: z
    .string()
    .describe('Detailed description of current dietary habits, including typical meals, portion sizes, and eating frequency.'),
  restrictions: z
    .string()
    .describe('Any dietary restrictions, allergies, or intolerances (e.g., gluten-free, dairy-free, nut allergy).'),
  preferences: z
    .string()
    .describe('Food preferences, favorite cuisines, disliked foods, and preferred cooking styles.'),
  healthGoals: z
    .string()
    .describe('User health goals, e.g., weight loss, muscle gain, improved energy, better gut health, general wellness.'),
  apiKey: z.string().optional().describe('Optional user-provided Google AI API key.'),
});

export type AnalyzeDietaryHabitsInput = z.infer<typeof AnalyzeDietaryHabitsInputSchema>;

const AnalyzeDietaryHabitsOutputSchema = z.object({
  insights: z.string().describe('Personalized insights based on the comprehensive dietary analysis, highlighting patterns and areas for improvement.'),
  recommendations: z
    .string()
    .describe('Specific, actionable dietary recommendations tailored to the user’s habits, goals, restrictions, and preferences.'),
  nutritionTips: z.array(z.string()).optional().describe('A list of general nutrition tips relevant to the user profile.'),
});

export type AnalyzeDietaryHabitsOutput = z.infer<typeof AnalyzeDietaryHabitsOutputSchema>;

export async function analyzeDietaryHabits(input: AnalyzeDietaryHabitsInput): Promise<AnalyzeDietaryHabitsOutput> {
  return analyzeDietaryHabitsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeDietaryHabitsPrompt',
  input: {schema: AnalyzeDietaryHabitsInputSchema.omit({ apiKey: true })}, // Exclude apiKey from prompt's direct input schema
  output: {schema: AnalyzeDietaryHabitsOutputSchema},
  prompt: `You are an expert AI Nutrition Coach. Analyze the following dietary information for a user and provide personalized insights, actionable recommendations, and relevant nutrition tips.

User Profile:
- Current Dietary Habits: {{{dietaryHabits}}}
- Dietary Restrictions/Allergies: {{{restrictions}}}
- Food Preferences/Dislikes: {{{preferences}}}
- Health Goals: {{{healthGoals}}}

Based on this profile:
1.  **Insights**: Provide a detailed analysis of their current habits. What are they doing well? What are the potential areas for improvement concerning their health goals?
2.  **Recommendations**: Offer specific, actionable advice. For example, instead of "eat more vegetables," suggest "try incorporating a side salad with lunch and dinner" or "add spinach to your morning smoothie." Recommendations should align with their preferences and restrictions.
3.  **Nutrition Tips**: Provide 2-3 general nutrition tips that are particularly relevant to their profile and goals.

Present the output in a clear, empathetic, and encouraging tone. Ensure the advice is practical and sustainable for the user.
`,
});

const analyzeDietaryHabitsFlow = ai.defineFlow(
  {
    name: 'analyzeDietaryHabitsFlow',
    inputSchema: AnalyzeDietaryHabitsInputSchema,
    outputSchema: AnalyzeDietaryHabitsOutputSchema,
  },
  async (input) => {
    const { apiKey, ...promptInput } = input;
    const options = apiKey ? { config: { apiKey } } : undefined;
    const { output } = await prompt(promptInput, options);
    return output!;
  }
);
