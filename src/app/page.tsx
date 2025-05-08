
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Utensils, Replace, ArrowRight, Leaf, MessageSquareHeart, Award, Users, BookOpen, BarChart3, HeartHandshake, Apple, ShoppingCart, Activity } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const features = [
    {
      icon: ClipboardList,
      title: "Personalized Dietary Analysis",
      description: "Gain deep insights into your eating habits, restrictions, preferences, and health goals with our advanced AI.",
      link: "/dietary-analysis",
      cta: "Analyze My Diet",
      image: "https://picsum.photos/seed/dietanalysis/600/400",
      aiHint: "nutrition facts",
    },
    {
      icon: Utensils,
      title: "Custom Meal Plan Generation",
      description: "Receive tailored meal plans considering your calorie goals, cooking time, cuisine choices, lifestyle, and family needs.",
      link: "/meal-plan",
      cta: "Create My Meal Plan",
      image: "https://picsum.photos/seed/mealplanadv/600/400",
      aiHint: "healthy meals",
    },
    {
      icon: Replace,
      title: "Recipe Alternative Suggestions",
      description: "Find suitable ingredient swaps or alternative recipes that fit your dietary restrictions and preferences.",
      link: "/recipe-alternatives",
      cta: "Find Alternatives",
      image: "https://picsum.photos/seed/recipealt/600/400",
      aiHint: "cooking ingredients",
    },
    {
      icon: MessageSquareHeart,
      title: "AI Nutrition Assistant",
      description: "Chat with our AI chatbot for setup help, nutrition questions, and daily encouragement.",
      link: "/chatbot",
      cta: "Chat with AI",
      image: "https://picsum.photos/seed/chatbot/600/400",
      aiHint: "friendly robot",
    },
     {
      icon: HeartHandshake,
      title: "Family Meal Planning",
      description: "Generate shared meal plans that cater to the dietary needs and preferences of your entire family.",
      link: "/meal-plan", // Links to the enhanced meal plan page
      cta: "Plan for Family",
      image: "https://picsum.photos/seed/familyplan/600/400",
      aiHint: "family dinner",
    },
    {
      icon: Award,
      title: "Challenges & Achievements",
      description: "Stay motivated with gamified challenges, points, and badges for hitting your nutrition milestones.",
      link: "/challenges",
      cta: "View Challenges",
      image: "https://picsum.photos/seed/gamify/600/400",
      aiHint: "trophy award",
    },
    {
      icon: Users,
      title: "Community Hub",
      description: "Share recipes, success stories, and join group challenges with fellow NutriCoach users. (Coming Soon)",
      link: "/community",
      cta: "Join Community",
      image: "https://picsum.photos/seed/communityhub/600/400",
      aiHint: "people talking",
    },
    {
      icon: BookOpen,
      title: "Educational Resources",
      description: "Access articles, videos, and webinars on nutrition, cooking skills, and mindful eating. (Coming Soon)",
      link: "/learn",
      cta: "Learn More",
      image: "https://picsum.photos/seed/education/600/400",
      aiHint: "open book",
    },
    {
      icon: BarChart3,
      title: "Progress & Symptom Tracking",
      description: "Log post-meal feelings and track your progress with visual charts and adherence stats. (Coming Soon)",
      link: "/progress-tracking",
      cta: "Track Progress",
      image: "https://picsum.photos/seed/progresstrack/600/400",
      aiHint: "health chart",
    },
  ];

  const dashboardSnippets = [
    {
      icon: Apple,
      title: "Today's Lunch Suggestion",
      description: "Quinoa salad with roasted vegetables. A light yet fulfilling option!",
      link: "/meal-plan",
      cta: "View Full Meal Plan",
    },
    {
      icon: ShoppingCart,
      title: "Shopping List Quick View",
      description: "Remember to pick up: avocados, spinach, and whole-grain bread.",
      link: "/meal-plan", // Assuming shopping list is part of meal plan
      cta: "See Full List",
    },
    {
      icon: Activity,
      title: "Your Progress Snapshot",
      description: "You've logged meals for 5 days straight! Keep it up!",
      link: "/progress-tracking",
      cta: "Track Details",
    },
    {
      icon: Users,
      title: "Community Highlights",
      description: "'Vegan Delights' group is discussing new protein sources. Join the chat!",
      link: "/community",
      cta: "Visit Community",
    },
  ];

  return (
    <div className="flex flex-col items-center space-y-8 md:space-y-12 w-full"> {/* Removed p-4/p-8, handled by AppLayout main */}
      <header className="text-center space-y-4 pt-4 md:pt-0">
        <Leaf className="mx-auto h-12 w-12 md:h-16 md:w-16 text-primary" />
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
          Welcome to NutriCoach AI
        </h1>
        <p className="text-md md:text-xl text-muted-foreground max-w-3xl">
          Your intelligent partner for highly personalized nutrition. Achieve your health goals with AI-driven dietary analysis, custom meal plans, interactive coaching, and smart recipe suggestions.
        </p>
      </header>

      {/* At-a-Glance Dashboard Section */}
      <section className="w-full max-w-7xl px-2 sm:px-0">
        <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-center text-foreground">Your At-a-Glance Dashboard</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {dashboardSnippets.map((snippet) => (
            <Card key={snippet.title} className="flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-1">
                  <snippet.icon className="h-6 w-6 md:h-7 md:w-7 text-accent" />
                  <CardTitle className="text-lg md:text-xl">{snippet.title}</CardTitle>
                </div>
                <CardDescription className="text-card-foreground/80 h-16 text-sm">
                  {snippet.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Link href={snippet.link} passHref>
                  <Button variant="outline" size="sm" className="w-full text-xs md:text-sm">
                    {snippet.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-center mt-6 text-xs md:text-sm text-muted-foreground">
          This is a preview. Full dashboard functionality with live, personalized data is coming soon!
        </p>
      </section>

      {/* Features Grid */}
      <section className="w-full max-w-7xl px-2 sm:px-0">
        <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center text-foreground pt-8">Explore NutriCoach Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature) => (
            <Card key={feature.title} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card">
              <div className="relative h-40 md:h-48 w-full">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  data-ai-hint={feature.aiHint}
                />
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-2">
                  <feature.icon className="h-7 w-7 md:h-8 md:w-8 text-accent" />
                  <CardTitle className="text-xl md:text-2xl">{feature.title}</CardTitle>
                </div>
                <CardDescription className="text-card-foreground/80 h-20 md:h-24 text-sm">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Link href={feature.link} passHref>
                  <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-sm md:text-base">
                    {feature.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="w-full max-w-4xl text-center py-8 md:py-12 px-2 sm:px-0">
        <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-foreground">How NutriCoach AI Elevates Your Journey</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 text-left">
          <div className="p-4 md:p-6 bg-card rounded-lg shadow-md">
            <h3 className="text-lg md:text-xl font-medium mb-2 text-primary">1. Deeply Personalize</h3>
            <p className="text-sm text-muted-foreground">Share your unique habits, goals, and preferences. Our AI listens and learns.</p>
          </div>
          <div className="p-4 md:p-6 bg-card rounded-lg shadow-md">
            <h3 className="text-lg md:text-xl font-medium mb-2 text-primary">2. AI-Powered Insights</h3>
            <p className="text-sm text-muted-foreground">Receive intelligent analysis, custom plans, and continuous support from our advanced AI.</p>
          </div>
          <div className="p-4 md:p-6 bg-card rounded-lg shadow-md">
            <h3 className="text-lg md:text-xl font-medium mb-2 text-primary">3. Engage & Evolve</h3>
            <p className="text-sm text-muted-foreground">Stay motivated with interactive tools, challenges, and resources that adapt with you.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

