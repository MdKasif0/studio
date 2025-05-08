
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Award, Flame, ShieldCheck, Star } from "lucide-react";
import Image from "next/image";

export default function ChallengesPage() {
  const challenges = [
    {
      title: "7-Day Healthy Start",
      description: "Log a healthy meal every day for 7 days straight.",
      points: 100,
      badgeIcon: Flame,
      status: "active",
      image: "https://picsum.photos/seed/challenge1/400/200",
      aiHint: "healthy breakfast",
    },
    {
      title: "Recipe Explorer",
      description: "Try and rate 5 new recipes from NutriCoach AI.",
      points: 150,
      badgeIcon: Star,
      status: "locked",
      image: "https://picsum.photos/seed/challenge2/400/200",
      aiHint: "cooking ingredients",
    },
    {
      title: "Mindful Eater",
      description: "Complete 3 mindful eating exercises this week.",
      points: 75,
      badgeIcon: ShieldCheck,
      status: "locked",
      image: "https://picsum.photos/seed/challenge3/400/200",
      aiHint: "meditation food",
    },
  ];

  return (
    <div className="container mx-auto py-4 md:py-8">
      <header className="mb-8 md:mb-12 text-center">
        <Award className="mx-auto h-12 w-12 md:h-16 md:w-16 text-accent mb-3 md:mb-4" />
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Challenges & Achievements</h1>
        <p className="mt-2 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Stay motivated! Complete challenges to earn points, unlock badges, and build healthy habits.
        </p>
      </header>

      <section className="mb-8 md:mb-12">
        <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-primary">Your Progress</h2>
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

      <section>
        <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-primary">Available Challenges</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {challenges.map((challenge, index) => (
            <Card key={index} className="shadow-xl overflow-hidden flex flex-col">
              <div className="relative h-32 md:h-40 w-full">
                <Image
                  src={challenge.image}
                  alt={challenge.title}
                  fill // Changed from layout="fill" to fill for Next 13+ Image
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover" // Changed from objectFit="cover"
                  data-ai-hint={challenge.aiHint}
                />
                {challenge.status === "locked" && (
                   <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                     <p className="text-white text-md md:text-lg font-semibold">Locked</p>
                   </div>
                )}
              </div>
              <CardHeader className="pb-2 pt-3 px-4">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg md:text-xl">{challenge.title}</CardTitle>
                  <challenge.badgeIcon className={`h-6 w-6 md:h-7 md:w-7 ${challenge.status === "active" ? "text-accent" : "text-muted"}`} />
                </div>
                <CardDescription className="h-12 md:h-16 text-xs md:text-sm">{challenge.description}</CardDescription>
              </CardHeader>
              <CardContent className="px-4 pt-2 pb-3">
                <div className="flex justify-between items-center mb-2 md:mb-3">
                  <Badge variant={challenge.status === "active" ? "default" : "secondary"} className="bg-primary/20 text-primary text-xs">
                    {challenge.points} Points
                  </Badge>
                  {challenge.status === "active" ? (
                     <Badge variant="default" className="bg-green-500 text-white text-xs">Active</Badge>
                  ) : (
                     <Badge variant="outline" className="text-xs">Locked</Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="px-4 pb-4 pt-0 mt-auto">
                 <Button className="w-full bg-accent hover:bg-accent/80 text-accent-foreground text-sm" disabled={challenge.status === "locked"}>
                  {challenge.status === "active" ? "View Progress" : "Unlock Challenge"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <p className="text-center mt-6 md:mt-8 text-xs md:text-sm text-muted-foreground">
          More challenges coming soon! Keep up the great work.
        </p>
      </section>
    </div>
  );
}
