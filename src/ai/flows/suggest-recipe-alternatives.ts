
'use server';

/**
 * @fileOverview AI agent that suggests alternative ingredients or recipes based on dietary restrictions.
 *
 * - suggestRecipeAlternatives - A function that suggests alternative ingredients or recipes.
 * - SuggestRecipeAlternativesInput - The input type for the suggestRecipeAlternatives function.
 * - SuggestRecipeAlternativesOutput - The return type for the suggestRecipeAlternatives function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRecipeAlternativesInputSchema = z.object({
  recipeName: z.string().describe('The name of the recipe.'),
  ingredients: z.string().describe('The ingredients of the recipe.'),
  dietaryRestrictions: z.string().describe('The dietary restrictions of the user.'),
  apiKey: z.string().optional().describe('Optional user-provided Google AI API key.'),
});
export type SuggestRecipeAlternativesInput = z.infer<typeof SuggestRecipeAlternativesInputSchema>;

const SuggestRecipeAlternativesOutputSchema = z.object({
  alternatives: z
    .string()
    .describe('Alternative ingredients or recipes that align with the user needs.'),
});
export type SuggestRecipeAlternativesOutput = z.infer<typeof SuggestRecipeAlternativesOutputSchema>;

export async function suggestRecipeAlternatives(
  input: SuggestRecipeAlternativesInput
): Promise<SuggestRecipeAlternativesOutput> {
  return suggestRecipeAlternativesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRecipeAlternativesPrompt',
  input: {schema: SuggestRecipeAlternativesInputSchema.omit({ apiKey: true })},
  output: {schema: SuggestRecipeAlternativesOutputSchema},
  prompt: `You are a personal AI recipe assistant. A user will give you a recipe name, ingredients, and dietary restrictions. You will suggest alternative ingredients or recipes that align with their needs.

Recipe Name: {{{recipeName}}}
Ingredients: {{{ingredients}}}
Dietary Restrictions: {{{dietaryRestrictions}}}

Suggest alternative ingredients or recipes:`,
});

const suggestRecipeAlternativesFlow = ai.defineFlow(
  {
    name: 'suggestRecipeAlternativesFlow',
    inputSchema: SuggestRecipeAlternativesInputSchema,
    outputSchema: SuggestRecipeAlternativesOutputSchema,
  },
  async (input) => {
    const { apiKey, ...promptInput } = input;
    const options = apiKey ? { config: { apiKey } } : undefined;
    const { output } = await prompt(promptInput, options);
    return output!;
  }
);
