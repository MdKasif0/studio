
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Custom Meal Plan Generator",
  description: "Generate custom meal plans tailored to your calorie goals, dietary needs, cooking time, and family preferences with Nutri AI.",
  keywords: ["meal plan generator", "custom meal plan", "ai meal planner", "nutrition plan", "diet plan", "Nutri AI"],
  openGraph: {
    title: "AI Custom Meal Plan Generator | Nutri AI",
    description: "Create personalized meal plans with our intelligent AI assistant.",
    url: "https://example.com/meal-plan", // Replace with your actual domain
  },
  twitter: {
    title: "AI Custom Meal Plan Generator | Nutri AI",
    description: "Generate your personalized meal plan today.",
  },
};

export default function MealPlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
