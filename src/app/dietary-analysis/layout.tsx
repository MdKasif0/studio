
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dietary Analysis - Personalized Insights",
  description: "Get a personalized dietary analysis from Nutri AI. Understand your eating habits, restrictions, and preferences to achieve your health goals.",
  keywords: ["dietary analysis", "nutrition assessment", "eating habits", "personalized diet", "health insights", "Nutri AI"],
   openGraph: {
    title: "Personalized Dietary Analysis | Nutri AI",
    description: "Understand your eating patterns and get AI-driven recommendations.",
    url: "https://example.com/dietary-analysis", // Replace with your actual domain
  },
  twitter: {
    title: "Personalized Dietary Analysis | Nutri AI",
    description: "Get AI-powered insights into your diet.",
  },
};

export default function DietaryAnalysisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
