
'use server';
/**
 * @fileOverview Generates dynamic content for the user's home dashboard.
 *
 * - homeDashboardFlow - A function that generates dashboard content.
 * - HomeDashboardInput - The input type for the homeDashboardFlow function.
 * - HomeDashboardOutput - The return type for the homeDashboardFlow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HomeDashboardInputSchema = z.object({
  userId: z.string().describe('The ID of the user.'),
  userProfile: z.object({
    healthGoals: z.string().optional().describe('User health goals, e.g., weight loss, muscle gain.'),
    dietaryRestrictions: z.string().optional().describe('User dietary restrictions, e.g., vegan, gluten-free.'),
  }).describe('Basic user profile information.'),
  currentDate: z.string().describe('The current date in YYYY-MM-DD format.'),
  apiKey: z.string().optional().describe('Optional user-provided Google AI API key.'),
});
export type HomeDashboardInput = z.infer<typeof HomeDashboardInputSchema>;

const HomeDashboardOutputSchema = z.object({
  lunchSuggestion: z.string().describe("A brief, appealing suggestion for today's lunch based on user profile."),
  shoppingListPreview: z.array(z.string()).describe("A short list of 2-3 essential grocery items relevant to upcoming meals or health goals."),
  progressSummary: z.string().describe("A concise, encouraging summary of recent progress or a motivational tip. e.g., 'You've logged meals for 5 days straight!' or 'Remember to stay hydrated today!'"),
  communityHighlight: z.string().optional().describe("A snippet of a trending discussion or an invitation to join a relevant group in the community hub. e.g., ''Vegan Delights' group is discussing new protein sources.'"),
});
export type HomeDashboardOutput = z.infer<typeof HomeDashboardOutputSchema>;

export async function homeDashboardFlow(input: HomeDashboardInput): Promise<HomeDashboardOutput> {
  return homeDashboardGenFlow(input);
}

const prompt = ai.definePrompt({
  name: 'homeDashboardPrompt',
  input: {schema: HomeDashboardInputSchema.omit({ apiKey: true })}, // apiKey is handled by the flow
  output: {schema: HomeDashboardOutputSchema},
  prompt: `You are an AI assistant for the Nutri AI app, tasked with generating engaging and personalized content for the user's 'At-a-Glance Dashboard'.
Today's Date: {{{currentDate}}}

User Profile:
- User ID: {{{userId}}}
- Health Goals: {{{userProfile.healthGoals}}}
- Dietary Restrictions: {{{userProfile.dietaryRestrictions}}}

Based on this information, provide the following:

1.  **Today's Lunch Suggestion**: A single, simple, and appealing lunch idea that aligns with their profile. Make it sound tasty.
    Example: "How about a vibrant Quinoa Salad with roasted chickpeas and a lemon-tahini dressing? Light, energizing, and packed with protein!"

2.  **Shopping List Quick View**: Suggest 2-3 grocery items they might need soon or that would be beneficial for their goals.
    Example: ["Fresh spinach for smoothies", "A block of firm tofu", "Whole-grain crackers for snacks"]

3.  **Progress Snapshot/Motivational Tip**: Provide a short, positive message. This could be a generic motivational tip or a (simulated) progress update.
    Example: "You're doing great focusing on your health goals! Remember, consistency is key." or "Tip: Add a handful of berries to your breakfast for an antioxidant boost!"

4.  **Community Highlight (Optional)**: If applicable, create a brief, enticing highlight from a fictional community discussion or group.
    Example: "The 'Healthy Habits' group is sharing their favorite 15-minute meal prep hacks this week. Check it out!" or "Trending now: 'My journey to mindful eating' - a success story from user FitFoodie123." If nothing relevant, omit this.

Keep responses concise, positive, and actionable.
`,
});

const homeDashboardGenFlow = ai.defineFlow(
  {
    name: 'homeDashboardGenFlow',
    inputSchema: HomeDashboardInputSchema,
    outputSchema: HomeDashboardOutputSchema,
  },
  async (input) => {
    const { apiKey, ...promptInput } = input;
    const options = apiKey ? { config: { apiKey } } : undefined;
    const { output } = await prompt(promptInput, options);
    return output!;
  }
);
