
import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-recipe-alternatives.ts';
import '@/ai/flows/analyze-dietary-habits.ts';
import '@/ai/flows/generate-custom-meal-plan.ts';
import '@/ai/flows/nutrition-chatbot-flow.ts';
import '@/ai/flows/home-dashboard-flow.ts'; // Added new flow
