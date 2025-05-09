
'use server';
/**
 * @fileOverview Suggests a healthy and appealing lunch for today.
 *
 * - suggestTodaysLunch - A function that suggests a lunch item.
 * - SuggestTodaysLunchInput - The input type for the suggestTodaysLunch function.
 * - SuggestTodaysLunchOutput - The return type for the suggestTodaysLunch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTodaysLunchInputSchema = z.object({
  dietaryPreferences: z.string().optional().describe('User\'s general dietary preferences (e.g., vegetarian, loves salads).'),
  healthGoals: z.string().optional().describe('User\'s primary health goals (e.g., weight loss, muscle gain).'),
});
export type SuggestTodaysLunchInput = z.infer<typeof SuggestTodaysLunchInputSchema>;

const SuggestTodaysLunchOutputSchema = z.object({
  suggestion: z.string().describe('The name of the suggested lunch dish.'),
  recipeBrief: z.string().optional().describe('A very brief, one-sentence preparation idea or highlight of the dish.'),
});
export type SuggestTodaysLunchOutput = z.infer<typeof SuggestTodaysLunchOutputSchema>;

export async function suggestTodaysLunch(input: SuggestTodaysLunchInput): Promise<SuggestTodaysLunchOutput> {
  return suggestTodaysLunchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTodaysLunchPrompt',
  input: {schema: SuggestTodaysLunchInputSchema},
  output: {schema: SuggestTodaysLunchOutputSchema},
  prompt: `You are a helpful nutrition assistant. Suggest a single, healthy, and appealing lunch dish for today.
{{#if dietaryPreferences}}
Considering these dietary preferences: {{{dietaryPreferences}}}.
{{/if}}
{{#if healthGoals}}
And these health goals: {{{healthGoals}}}.
{{/if}}
Provide the dish name and, if appropriate, a very brief one-sentence preparation idea or a key highlight of the dish. Be concise and inspiring.
Example: "Mediterranean Quinoa Salad", "A refreshing mix of quinoa, cucumbers, tomatoes, olives, and feta with a lemon-herb dressing."
Example: "Chicken Avocado Sandwich on Whole Wheat", "Creamy avocado and grilled chicken make this a satisfying and protein-rich choice."
`,
});

const suggestTodaysLunchFlow = ai.defineFlow(
  {
    name: 'suggestTodaysLunchFlow',
    inputSchema: SuggestTodaysLunchInputSchema,
    outputSchema: SuggestTodaysLunchOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
