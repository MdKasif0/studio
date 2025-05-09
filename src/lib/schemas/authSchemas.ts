
import { z } from "zod";

export const healthGoals = [
  "Lose Weight",
  "Maintain Weight",
  "Gain Muscle",
  "Improve Overall Health",
  "Manage Specific Condition", // Added for more options
  "Increase Energy Levels",
  "Other",
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
  paleo: "Paleo", // Added for more options
  lowFodmap: "Low FODMAP", // Added
} as const;

export const cookingTimePreferences = [
    "Quick (under 30 mins)",
    "Moderate (30-60 mins)",
    "Flexible (any duration)",
] as const;


export const loginSchema = z.object({
  usernameOrEmail: z.string().min(1, { message: "Username or Email is required." }),
  password: z.string().min(1, { message: "Password is required." }),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters." })
  .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
  .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
  .regex(/[0-9]/, { message: "Password must contain at least one number." })
  .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character." });

export const signUpSchema = z
  .object({
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters." })
      .max(20, { message: "Username must be at most 20 characters." })
      .regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores."}),
    email: z.string().email({ message: "Invalid email address." }),
    password: passwordSchema,
    confirmPassword: z.string(),
    // primaryHealthGoal and dietaryRestrictions removed from here, will be collected during onboarding
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"], // Path to show the error on
  });

export type SignUpFormData = z.infer<typeof signUpSchema>;


export const accountSettingsSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters." })
    .max(20, { message: "Username must be at most 20 characters." })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores."}),
  email: z.string().email({ message: "Invalid email address." }),
  primaryHealthGoal: z.enum(healthGoals, {
    errorMap: () => ({ message: "Please select a valid health goal." }),
  }),
  dietaryRestrictions: z.object(
      Object.fromEntries(
        Object.keys(commonDietaryRestrictions).map(key => [key, z.boolean().default(false).optional()])
      ) as Record<keyof typeof commonDietaryRestrictions, z.ZodOptional<z.ZodBoolean>> & { other: z.ZodOptional<z.ZodString> }
    ).extend({ other: z.string().optional()}).optional(),
  foodPreferences: z.string().optional().describe("User's favorite cuisines, liked/disliked foods."),
  cookingTimePreference: z.enum(cookingTimePreferences).optional().describe("User's preferred cooking time per meal."),
  lifestyleInfo: z.string().optional().describe("Brief description of user's lifestyle (e.g., busy parent, athlete)."),
});

export type AccountSettingsFormData = z.infer<typeof accountSettingsSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, {message: "Current password is required."}),
  newPassword: passwordSchema,
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "New passwords do not match.",
  path: ["confirmNewPassword"],
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// Schema for Onboarding Wizard
export const onboardingSchema = z.object({
  primaryHealthGoal: z.enum(healthGoals, {
    required_error: "Please select your primary health goal.",
  }),
  dietaryRestrictions: z.object(
    Object.fromEntries(
      Object.keys(commonDietaryRestrictions).map(key => [key, z.boolean().default(false).optional()])
    ) as Record<keyof typeof commonDietaryRestrictions, z.ZodOptional<z.ZodBoolean>> & { other: z.ZodOptional<z.ZodString> }
  ).extend({ other: z.string().optional()}),
  foodPreferences: z.string().optional(),
  cookingTimePreference: z.enum(cookingTimePreferences, {
    required_error: "Please select your cooking time preference.",
  }),
  lifestyleInfo: z.string().optional(),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;
