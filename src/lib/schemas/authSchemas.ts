
import { z } from "zod";

export const healthGoals = [
  "Lose Weight",
  "Maintain Weight",
  "Gain Muscle",
  "Improve Overall Health",
] as const;

export const commonDietaryRestrictions = {
  glutenFree: "Gluten-Free",
  dairyFree: "Dairy-Free",
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  nutAllergy: "Nut Allergy",
  shellfishAllergy: "Shellfish Allergy",
  soyAllergy: "Soy Allergy",
  lowCarb: "Low Carb",
  keto: "Keto",
} as const;

export const loginSchema = z.object({
  usernameOrEmail: z.string().min(1, { message: "Username or Email is required." }),
  password: z.string().min(1, { message: "Password is required." }),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const signUpSchema = z
  .object({
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters." })
      .max(20, { message: "Username must be at most 20 characters." }),
    email: z.string().email({ message: "Invalid email address." }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
      .regex(/[0-9]/, { message: "Password must contain at least one number." })
      .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character." }),
    confirmPassword: z.string(),
    dietaryRestrictions: z.object({
      glutenFree: z.boolean().default(false).optional(),
      dairyFree: z.boolean().default(false).optional(),
      vegetarian: z.boolean().default(false).optional(),
      vegan: z.boolean().default(false).optional(),
      nutAllergy: z.boolean().default(false).optional(),
      shellfishAllergy: z.boolean().default(false).optional(),
      soyAllergy: z.boolean().default(false).optional(),
      lowCarb: z.boolean().default(false).optional(),
      keto: z.boolean().default(false).optional(),
      other: z.string().optional(),
    }).optional(),
    primaryHealthGoal: z.enum(healthGoals, {
        errorMap: () => ({ message: "Please select a valid health goal." }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"], // Path to show the error on
  });

export type SignUpFormData = z.infer<typeof signUpSchema>;
