
import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-recipe-alternatives.ts';
import '@/ai/flows/analyze-dietary-habits.ts';
import '@/ai/flows/generate-custom-meal-plan.ts';
import '@/ai/flows/nutrition-chatbot-flow.ts';
import '@/ai/flows/suggest-todays-lunch-flow.ts';
import '@/ai/flows/generate-quick-shopping-list-flow.ts';
import '@/ai/flows/generate-progress-snapshot-message-flow.ts';
