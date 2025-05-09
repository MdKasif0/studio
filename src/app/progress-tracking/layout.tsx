
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Progress & Symptom Tracking",
  description: "Track your nutritional progress, log post-meal symptoms, and visualize your achievements with Nutri AI. (Not a medical tool).",
  keywords: ["progress tracking", "symptom logger", "nutrition tracker", "health journal", "diet adherence", "Nutri AI"],
  openGraph: {
    title: "Track Your Nutrition Progress with Nutri AI",
    description: "Log symptoms, monitor intake, and visualize your health journey. (Not a medical tool)",
    url: "https://example.com/progress-tracking", // Replace with your actual domain
  },
  twitter: {
    title: "Track Your Nutrition Progress | Nutri AI",
    description: "Monitor your health journey with Nutri AI's tracking tools.",
  },
};

export default function ProgressTrackingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
