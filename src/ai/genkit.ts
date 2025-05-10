
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI({ requireApiKey: false })], // Explicitly state API key is not required at init
  model: 'googleai/gemini-2.0-flash',
});

