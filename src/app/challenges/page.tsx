
"use client"; // Add "use client" to make this a Client Component

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Award, Flame, ShieldCheck, Star } from "lucide-react";
import Image from "next/image";
import type { Metadata } from "next";
import { ChallengeCard } from "@/components/challenges/ChallengeCard";

// Metadata should be defined outside the component if it's a client component,
// or handled in a parent layout. For a page component marked "use client",
// metadata export might not work as expected for static generation.
// However, Netlify error is about prerendering, let's see if "use client" alone fixes it.
// export const metadata: Metadata = {
//   title: "Nutrition Challenges & Achievements | Nutri AI",
//   description: "Stay motivated with Nutri AI! Complete nutrition challenges, earn points, unlock badges, and build healthy habits.",
//   keywords: ["nutrition challenges", "health achievements", "gamification", "healthy habits", "motivation", "Nutri AI"],
//   openGraph: {
//     title: "Take on Nutrition Challenges with Nutri AI",
//     description: "Earn points and badges by completing fun and healthy challenges.",
//     url: "https://example.com/challenges", // Replace with your actual domain
//   },
//   twitter: {
//     title: "Nutrition Challenges & Achievements | Nutri AI",
//     description: "Get motivated and track your health milestones.",
//   },
// };

export default function ChallengesPage() {
  const challenges = [
    {
      title: "7-Day Healthy Start",
      description: "Log a healthy meal every day for 7 days straight.",
      points: 100,
      badgeIcon: Flame,
      status: "active" as "active" | "locked" | "completed",
      image: "https://picsum.photos/seed/challenge1/400/200",
      aiHint: "healthy breakfast",
    },
    {
      title: "Recipe Explorer",
      description: "Try and rate 5 new recipes from NutriCoach AI.",
      points: 150,
      badgeIcon: Star,
      status: "completed" as "active" | "locked" | "completed",
      image: "https://picsum.photos/seed/challenge2/400/200",
      aiHint: "cooking ingredients",
    },
    {
      title: "Mindful Eater",
      description: "Complete 3 mindful eating exercises this week.",
      points: 75,
      badgeIcon: ShieldCheck,
      status: "locked" as "active" | "locked" | "completed",
      image: "https://picsum.photos/seed/challenge3/400/200",
      aiHint: "meditation food",
    },
  ];

  return (
    <div className="container mx-auto py-4 md:py-8 animate-in fade-in duration-500">
      <header className="mb-8 md:mb-12 text-center">
        <Award className="mx-auto h-12 w-12 md:h-16 md:w-16 text-accent mb-3 md:mb-4" />
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Challenges & Achievements</h1>
        <p className="mt-2 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Stay motivated! Complete challenges to earn points, unlock badges, and build healthy habits.
        </p>
      </header>

      <section aria-labelledby="progress-heading" className="mb-8 md:mb-12 animate-in fade-in-25 duration-700">
        <h2 id="progress-heading" className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-primary">Your Progress</h2>
        <Card className="shadow-lg">
          <CardContent className="p-4 md:p-6 flex flex-col sm:flex-row justify-around items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-accent">1,250</p>
              <p className="text-sm md:text-base text-muted-foreground">Total Points</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-accent">3</p>
              <p className="text-sm md:text-base text-muted-foreground">Badges Unlocked</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-accent">Level 5</p>
              <p className="text-sm md:text-base text-muted-foreground">Nutrition Novice</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="available-challenges-heading" className="animate-in fade-in-50 duration-900">
        <h2 id="available-challenges-heading" className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-primary">Available Challenges</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {challenges.map((challenge, index) => (
            <ChallengeCard key={index} challenge={challenge} index={index} />
          ))}
        </div>
        <p className="text-center mt-6 md:mt-8 text-xs md:text-sm text-muted-foreground">
          More challenges coming soon! Keep up the great work.
        </p>
      </section>
    </div>
  );
}
