import { z } from "zod";

export const symptomLogSchema = z.object({
  mealName: z.string().min(1, "Please enter the meal name or description."),
  logTime: z.string().min(1, "Please select the time of logging."), // Stays as string for datetime-local
  energyLevel: z.enum(["low", "medium", "high", "unchanged"], { errorMap: () => ({message: "Please select an energy level."})}).optional(),
  mood: z.string().optional(),
  digestiveSymptoms: z.string().optional(),
  otherSymptoms: z.string().optional(),
  notes: z.string().optional(),
});

export type SymptomLogFormValues = z.infer<typeof symptomLogSchema>;

// Add other app-specific (non-auth) schemas here as needed