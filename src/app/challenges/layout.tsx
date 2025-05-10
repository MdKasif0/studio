
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nutrition Challenges & Achievements | Nutri AI",
  description: "Stay motivated with Nutri AI! Complete nutrition challenges, earn points, unlock badges, and build healthy habits.",
  keywords: ["nutrition challenges", "health achievements", "gamification", "healthy habits", "motivation", "Nutri AI"],
  openGraph: {
    title: "Take on Nutrition Challenges with Nutri AI",
    description: "Earn points and badges by completing fun and healthy challenges.",
    url: "https://example.com/challenges", // Replace with your actual domain
  },
  twitter: {
    title: "Nutrition Challenges & Achievements | Nutri AI",
    description: "Get motivated and track your health milestones.",
  },
};

export default function ChallengesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
