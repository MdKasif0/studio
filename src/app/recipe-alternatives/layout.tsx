
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recipe Alternatives & Ingredient Swaps",
  description: "Find suitable ingredient substitutions or alternative recipes that fit your dietary restrictions and preferences with Nutri AI's smart suggester.",
  keywords: ["recipe alternatives", "ingredient swaps", "dietary restrictions recipes", "ai recipe suggester", "Nutri AI"],
   openGraph: {
    title: "AI Recipe & Ingredient Swaps | Nutri AI",
    description: "Adapt any recipe to your dietary needs with smart AI suggestions.",
    url: "https://example.com/recipe-alternatives", // Replace with your actual domain
  },
  twitter: {
    title: "AI Recipe & Ingredient Swaps | Nutri AI",
    description: "Find the perfect recipe alternatives with Nutri AI.",
  },
};

export default function RecipeAlternativesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
