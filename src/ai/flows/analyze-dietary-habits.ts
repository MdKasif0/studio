// This is an AI-powered personalized nutrition coach that analyzes dietary habits and restrictions, creating custom meal plans and recipe suggestions tailored to individual needs.
'use server';
/**
 * @fileOverview Analyzes dietary habits, restrictions, and preferences to provide personalized insights and recommendations.
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
    .describe('Detailed description of current dietary habits.'),
  restrictions: z
    .string()
    .describe('Any dietary restrictions or allergies.'),
  preferences: z
    .string()
    .describe('Food preferences and dislikes.'),
});

export type AnalyzeDietaryHabitsInput = z.infer<typeof AnalyzeDietaryHabitsInputSchema>;

const AnalyzeDietaryHabitsOutputSchema = z.object({
  insights: z.string().describe('Personalized insights based on dietary analysis.'),
  recommendations: z
    .string()
    .describe('Specific dietary recommendations tailored to the user.'),
});

export type AnalyzeDietaryHabitsOutput = z.infer<typeof AnalyzeDietaryHabitsOutputSchema>;

export async function analyzeDietaryHabits(input: AnalyzeDietaryHabitsInput): Promise<AnalyzeDietaryHabitsOutput> {
  return analyzeDietaryHabitsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeDietaryHabitsPrompt',
  input: {schema: AnalyzeDietaryHabitsInputSchema},
  output: {schema: AnalyzeDietaryHabitsOutputSchema},
  prompt: `Analyze the following dietary information and provide personalized insights and recommendations.

Dietary Habits: {{{dietaryHabits}}}
Restrictions: {{{restrictions}}}
Preferences: {{{preferences}}}

Provide insights and recommendations in a clear and actionable manner.`,
});

const analyzeDietaryHabitsFlow = ai.defineFlow(
  {
    name: 'analyzeDietaryHabitsFlow',
    inputSchema: AnalyzeDietaryHabitsInputSchema,
    outputSchema: AnalyzeDietaryHabitsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
