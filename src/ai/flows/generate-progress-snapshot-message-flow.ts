
'use server';
/**
 * @fileOverview Generates a motivational message for the user's progress snapshot.
 *
 * - generateProgressSnapshotMessage - A function that generates a progress message.
 * - GenerateProgressSnapshotMessageInput - The input type for the generateProgressSnapshotMessage function.
 * - GenerateProgressSnapshotMessageOutput - The return type for the generateProgressSnapshotMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProgressSnapshotMessageInputSchema = z.object({
  mealLogStreak: z.number().describe('Number of consecutive days the user has logged at least one meal/symptom.'),
  userName: z.string().optional().describe('The user\'s name for personalization.'),
});
export type GenerateProgressSnapshotMessageInput = z.infer<typeof GenerateProgressSnapshotMessageInputSchema>;

const GenerateProgressSnapshotMessageOutputSchema = z.object({
  message: z.string().describe('A short, encouraging message based on the user\'s meal logging streak.'),
});
export type GenerateProgressSnapshotMessageOutput = z.infer<typeof GenerateProgressSnapshotMessageOutputSchema>;

export async function generateProgressSnapshotMessage(input: GenerateProgressSnapshotMessageInput): Promise<GenerateProgressSnapshotMessageOutput> {
  return generateProgressSnapshotMessageFlow(input);
}

// This prompt constant is not directly used by the flow logic below,
// as the flow constructs the prompt dynamically. It can be kept for reference or removed.
// const unusedPromptReference = ai.definePrompt({
//   name: 'generateProgressSnapshotMessagePrompt',
//   input: {schema: GenerateProgressSnapshotMessageInputSchema},
//   output: {schema: GenerateProgressSnapshotMessageOutputSchema},
//   prompt: `You are an encouraging AI nutrition coach. Generate a short, positive message for the user's progress snapshot.
// {{#if userName}}Hi {{{userName}}}! {{/if}}
// {{#if mealLogStreak}}
//   {{#if (eq mealLogStreak 0)}}
//     Start logging your meals and feelings to track your progress and get personalized insights! What's one healthy choice you can make today?
//   {{else if (eq mealLogStreak 1)}}
//     Great start! You've logged for 1 day. Keep building that healthy habit!
//   {{else if (lt mealLogStreak 7)}}
//     You've logged meals for {{{mealLogStreak}}} days straight! Awesome consistency. Keep it up!
//   {{else if (lt mealLogStreak 30)}}
//     Amazing! {{{mealLogStreak}}} days of consistent logging. You're building strong habits!
//   {{else}}
//     Wow, {{{mealLogStreak}}} days of dedication! You're a true nutrition champion!
//   {{/if}}
// {{else}}
// Start logging your meals and feelings to track your progress and get personalized insights! What's one healthy choice you can make today?
// {{/if}}
// Keep up the fantastic work on your wellness journey!
// `,
// });


const generateProgressSnapshotMessageFlow = ai.defineFlow(
  {
    name: 'generateProgressSnapshotMessageFlow',
    inputSchema: GenerateProgressSnapshotMessageInputSchema,
    outputSchema: GenerateProgressSnapshotMessageOutputSchema,
  },
  async input => {
    let customPrompt = `You are an encouraging AI nutrition coach. Generate a short, positive message for the user's progress snapshot.\n`;
    if (input.userName) {
      customPrompt += `Hi ${input.userName}! `;
    }

    if (input.mealLogStreak > 0) {
      if (input.mealLogStreak === 1) {
        customPrompt += `Great start! You've logged for 1 day. Keep building that healthy habit!`;
      } else if (input.mealLogStreak < 7) {
        customPrompt += `You've logged meals for ${input.mealLogStreak} days straight! Awesome consistency. Keep it up!`;
      } else if (input.mealLogStreak < 30) {
        customPrompt += `Amazing! ${input.mealLogStreak} days of consistent logging. You're building strong habits!`;
      } else {
        customPrompt += `Wow, ${input.mealLogStreak} days of dedication! You're a true nutrition champion!`;
      }
    } else {
      customPrompt += `Start logging your meals and feelings to track your progress and get personalized insights! What's one healthy choice you can make today?`;
    }
    customPrompt += ` Keep up the fantastic work on your wellness journey!`;

    const dynamicPrompt = ai.definePrompt({
        name: 'generateProgressSnapshotMessageDynamicPrompt',
        output: {schema: GenerateProgressSnapshotMessageOutputSchema},
        prompt: customPrompt,
    });

    const llmResponse = await dynamicPrompt({}); // No input needed as it's embedded in prompt string
    const output = llmResponse.output; // output can be null

    if (output && typeof output.message === 'string') {
      return output;
    }
    console.warn('GenerateProgressSnapshotMessage: AI did not return expected message or output was null. Input:', input, 'LLM Output:', output);
    return { message: "Keep up the great work! We're having a little trouble generating a custom message right now." };
  }
);

