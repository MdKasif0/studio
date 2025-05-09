
'use server';
/**
 * @fileOverview Generates a quick list of 3-4 essential healthy grocery items.
 *
 * - generateQuickShoppingList - A function that generates a short shopping list.
 * - GenerateQuickShoppingListInput - The input type for the generateQuickShoppingList function.
 * - GenerateQuickShoppingListOutput - The return type for the generateQuickShoppingList function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuickShoppingListInputSchema = z.object({
  healthGoal: z.string().optional().describe('User\'s primary health goal (e.g., weight loss, muscle gain) to tailor suggestions slightly.'),
});
export type GenerateQuickShoppingListInput = z.infer<typeof GenerateQuickShoppingListInputSchema>;

const GenerateQuickShoppingListOutputSchema = z.object({
  items: z.array(z.string()).describe('A list of 3-4 essential healthy grocery items.'),
});
export type GenerateQuickShoppingListOutput = z.infer<typeof GenerateQuickShoppingListOutputSchema>;

export async function generateQuickShoppingList(input: GenerateQuickShoppingListInput): Promise<GenerateQuickShoppingListOutput> {
  return generateQuickShoppingListFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuickShoppingListPrompt',
  input: {schema: GenerateQuickShoppingListInputSchema},
  output: {schema: GenerateQuickShoppingListOutputSchema},
  prompt: `You are a helpful nutrition assistant. Suggest 3-4 essential and versatile healthy grocery items for a quick shopping trip.
{{#if healthGoal}}
The user's primary health goal is "{{{healthGoal}}}". Slightly tailor the suggestions if relevant, but keep them general purpose.
{{/if}}
Focus on items that can be used in various healthy meals.
For example:
- If goal is "muscle gain": Lean protein (chicken breast), Eggs, Greek yogurt, Oats.
- If goal is "weight loss": Leafy greens, Berries, Lean protein (fish), Non-starchy vegetables (broccoli).
- General: Avocado, Spinach, Whole-grain bread, Almonds.
Output only the list of items.
`,
});

const generateQuickShoppingListFlow = ai.defineFlow(
  {
    name: 'generateQuickShoppingListFlow',
    inputSchema: GenerateQuickShoppingListInputSchema,
    outputSchema: GenerateQuickShoppingListOutputSchema,
  },
  async input => {
    const llmResponse = await prompt(input);
    const output = llmResponse.output; // output can be null

    // Ensure items are always returned, even if empty, and not more than 4.
    if (output && output.items && Array.isArray(output.items)) {
        return { items: output.items.slice(0, 4) };
    }
    console.warn('QuickShoppingList: AI did not return expected items or output was null. Input:', input, 'LLM Output:', output);
    return { items: [] }; // Return empty list for graceful degradation in UI
  }
);

