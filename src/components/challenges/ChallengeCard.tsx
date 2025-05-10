// src/components/challenges/ChallengeCard.tsx
"use client";

import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Challenge {
  title: string;
  description: string;
  points: number;
  badgeIcon: LucideIcon;
  status: "active" | "locked" | "completed"; // Added completed status
  image: string;
  aiHint: string;
}

interface ChallengeCardProps {
  challenge: Challenge;
  index: number; // For image priority loading
}

export function ChallengeCard({ challenge, index }: ChallengeCardProps) {
  const { toast } = useToast();

  const handleShareChallenge = () => {
    toast({
      title: "Challenge Shared!",
      description: `You shared the "${challenge.title}" challenge. (Simulated)`,
    });
  };

  return (
    <Card className="shadow-xl overflow-hidden flex flex-col">
      <div className="relative h-32 md:h-40 w-full">
        <Image
          src={challenge.image}
          alt={`Image for ${challenge.title} challenge`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          data-ai-hint={challenge.aiHint}
          priority={index < 2}
          loading={index < 2 ? "eager" : "lazy"}
        />
        {challenge.status === "locked" && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <p className="text-white text-md md:text-lg font-semibold">Locked</p>
          </div>
        )}
         {challenge.status === "completed" && (
          <div className="absolute inset-0 bg-green-600/70 flex items-center justify-center">
            <p className="text-white text-md md:text-lg font-semibold">Completed!</p>
          </div>
        )}
        <Button
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 bg-background/60 hover:bg-background/80 text-foreground"
            onClick={handleShareChallenge}
            aria-label="Share challenge"
          >
            <Share2 className="h-4 w-4" />
        </Button>
      </div>
      <CardHeader className="pb-2 pt-3 px-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg md:text-xl">{challenge.title}</CardTitle>
          <challenge.badgeIcon
            aria-hidden="true"
            className={`h-6 w-6 md:h-7 md:w-7 ${
              challenge.status === "active" || challenge.status === "completed" ? "text-accent" : "text-muted"
            }`}
          />
        </div>
        <CardDescription className="h-12 md:h-16 text-xs md:text-sm">{challenge.description}</CardDescription>
      </CardHeader>
      <CardContent className="px-4 pt-2 pb-3">
        <div className="flex justify-between items-center mb-2 md:mb-3">
          <Badge variant={challenge.status === "active" || challenge.status === "completed" ? "default" : "secondary"} className="bg-primary/20 text-primary text-xs">
            {challenge.points} Points
          </Badge>
          {challenge.status === "active" ? (
            <Badge variant="default" className="bg-green-500 text-white text-xs">Active</Badge>
          ) : challenge.status === "completed" ? (
            <Badge variant="default" className="bg-accent text-accent-foreground text-xs">Completed</Badge>
          ) : (
            <Badge variant="outline" className="text-xs">Locked</Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="px-4 pb-4 pt-0 mt-auto">
        <Button
          className="w-full bg-accent hover:bg-accent/80 text-accent-foreground text-sm"
          disabled={challenge.status === "locked" || challenge.status === "completed"}
        >
          {challenge.status === "active" ? "View Progress" : challenge.status === "completed" ? "Completed" : "Unlock Challenge"}
        </Button>
      </CardFooter>
    </Card>
  );
}
