
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Utensils, Replace, ArrowRight, Leaf } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const features = [
    {
      icon: ClipboardList,
      title: "Personalized Dietary Analysis",
      description: "Understand your eating habits with AI-powered insights and tailored recommendations.",
      link: "/dietary-analysis",
      cta: "Analyze My Diet",
      image: "https://picsum.photos/seed/diet/600/400",
      aiHint: "healthy food",
    },
    {
      icon: Utensils,
      title: "Custom Meal Plan Generation",
      description: "Get meal plans designed specifically for your dietary needs, preferences, and calorie goals.",
      link: "/meal-plan",
      cta: "Create My Meal Plan",
      image: "https://picsum.photos/seed/mealplan/600/400",
      aiHint: "meal prep",
    },
    {
      icon: Replace,
      title: "Recipe Alternative Suggestions",
      description: "Find suitable ingredient swaps or alternative recipes that fit your dietary restrictions.",
      link: "/recipe-alternatives",
      cta: "Find Alternatives",
      image: "https://picsum.photos/seed/recipe/600/400",
      aiHint: "ingredients cooking",
    },
  ];

  return (
    <div className="flex flex-col items-center space-y-12 p-4 md:p-8">
      <header className="text-center space-y-4">
        <Leaf className="mx-auto h-16 w-16 text-primary" />
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
          Welcome to NutriCoach AI
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
          Your intelligent partner for personalized nutrition. Achieve your health goals with AI-driven dietary analysis, custom meal plans, and smart recipe suggestions.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        {features.map((feature) => (
          <Card key={feature.title} className="flex flex-col overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <div className="relative h-48 w-full">
              <Image
                src={feature.image}
                alt={feature.title}
                layout="fill"
                objectFit="cover"
                data-ai-hint={feature.aiHint}
              />
            </div>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <feature.icon className="h-8 w-8 text-accent" />
                <CardTitle className="text-2xl">{feature.title}</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground h-20"> {/* Fixed height for description */}
                {feature.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto"> {/* Pushes button to the bottom */}
              <Link href={feature.link} passHref>
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  {feature.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="w-full max-w-4xl text-center py-12">
        <h2 className="text-3xl font-semibold mb-6 text-foreground">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 bg-card rounded-lg shadow-md">
            <h3 className="text-xl font-medium mb-2 text-primary">1. Tell Us About You</h3>
            <p className="text-muted-foreground">Input your dietary habits, restrictions, preferences, and goals through our intuitive forms.</p>
          </div>
          <div className="p-6 bg-card rounded-lg shadow-md">
            <h3 className="text-xl font-medium mb-2 text-primary">2. AI-Powered Analysis</h3>
            <p className="text-muted-foreground">Our advanced AI analyzes your information to provide personalized insights and suggestions.</p>
          </div>
          <div className="p-6 bg-card rounded-lg shadow-md">
            <h3 className="text-xl font-medium mb-2 text-primary">3. Personalized Coaching</h3>
            <p className="text-muted-foreground">Receive custom meal plans, recipe ideas, and dietary advice tailored to your unique profile.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
