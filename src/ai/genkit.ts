
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import type {Plugin} from 'genkit'; // Use 'import type'

const pluginsToLoad: Plugin<unknown>[] = [];
let defaultGenkitModel: string | undefined = undefined;

// It's crucial that GOOGLE_API_KEY (or other necessary Google Cloud credentials)
// are set in the environment where the Next.js server runs (e.g., Firebase Studio Preview settings).
// This code makes the app more resilient if the key is missing at startup.
if (process.env.GOOGLE_API_KEY) {
  try {
    // Attempt to add the Google AI plugin only if the API key is present.
    pluginsToLoad.push(googleAI());
    defaultGenkitModel = 'googleai/gemini-2.0-flash';
  } catch (e) {
    console.error(
        "NutriAI Critical Error: Failed to initialize Google AI plugin even with GOOGLE_API_KEY present. " +
        "AI features will be severely impacted or unavailable. Error details:", 
        e
    );
    // Reset to ensure no partial state if googleAI() threw an error
    pluginsToLoad.length = 0; 
    defaultGenkitModel = undefined;
  }
} else {
  console.warn(
    'NutriAI Warning: GOOGLE_API_KEY environment variable is not set. ' +
    'The Google AI plugin will not be loaded, and AI features requiring it will be unavailable. ' +
    'This might be expected in some local development setups if an API key is not configured. ' +
    'However, for full functionality in development or any deployed environment (including previews), ' +
    'ensure GOOGLE_API_KEY is correctly set.'
  );
}

export const ai = genkit({
  plugins: pluginsToLoad,
  model: defaultGenkitModel, // Will be undefined if googleAI plugin isn't loaded
});

/**
 * Checks if the AI system is likely functional.
 * This is a basic check; more sophisticated health checks could be added.
 * @returns {boolean} True if AI seems functional, false otherwise.
 */
export function isAiFunctional(): boolean {
  // A simple check: if we have successfully loaded plugins and a default model,
  // assume basic AI functionality is possible.
  return pluginsToLoad.length > 0 && !!defaultGenkitModel;
}
