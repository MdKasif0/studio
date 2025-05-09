
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ClipboardList, Utensils, Replace, ArrowRight, Leaf, MessageSquareHeart, Award, Users, BookOpen, BarChart3, HeartHandshake, Apple, ShoppingCart, Activity, Terminal, RefreshCw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next"; // Still useful for reference, though not directly applied in client component
import { getAuthUser, getUserDetails, getSymptomLogs, type AuthUser, type StoredUserDetails, type SymptomLogEntry } from "@/lib/authLocalStorage";
import { handleSuggestTodaysLunch, handleGenerateQuickShoppingList, handleGenerateProgressMessage } from "@/lib/actions";
import type { SuggestTodaysLunchInput, SuggestTodaysLunchOutput } from "@/ai/flows/suggest-todays-lunch-flow";
import type { GenerateQuickShoppingListInput, GenerateQuickShoppingListOutput } from "@/ai/flows/generate-quick-shopping-list-flow";
import type { GenerateProgressSnapshotMessageInput, GenerateProgressSnapshotMessageOutput } from "@/ai/flows/generate-progress-snapshot-message-flow";
import { useToast } from "@/hooks/use-toast";


// export const metadata: Metadata = { ... } // Metadata is better handled in layout or server components

interface DashboardSnippetState {
  title: string;
  description: string;
  icon: React.ElementType;
  cta: string;
  link: string;
  isLoading: boolean;
  error?: string;
  action?: () => void; // For retry
}

const initialDashboardSnippets: DashboardSnippetState[] = [
  {
    icon: Apple,
    title: "Today's Lunch Suggestion",
    description: "Thinking of a healthy lunch for you...",
    link: "/meal-plan",
    cta: "View Full Meal Plan",
    isLoading: true,
  },
  {
    icon: ShoppingCart,
    title: "Shopping List Quick View",
    description: "Generating a few essentials for you...",
    link: "/meal-plan", 
    cta: "See Full List",
    isLoading: true,
  },
  {
    icon: Activity,
    title: "Your Progress Snapshot",
    description: "Checking your latest progress...",
    link: "/progress-tracking",
    cta: "Track Details",
    isLoading: true,
  },
  {
    icon: Users,
    title: "Community Highlights",
    description: "'Vegan Delights' group is discussing new protein sources. Join the chat!",
    link: "/community",
    cta: "Visit Community",
    isLoading: false, // Static for now
  },
];


export default function HomePage() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [userDetails, setUserDetails] = useState<StoredUserDetails | null>(null);
  const [symptomLogs, setSymptomLogs] = useState<SymptomLogEntry[]>([]);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  const [dashboardSnippets, setDashboardSnippets] = useState<DashboardSnippetState[]>(initialDashboardSnippets);

  useEffect(() => {
    setIsClient(true);
    const user = getAuthUser();
    setAuthUser(user);
    if (user) {
      const details = getUserDetails(user.id);
      setUserDetails(details);
      const logs = getSymptomLogs(user.id);
      setSymptomLogs(logs);
    }
  }, []);

  const updateSnippet = useCallback((title: string, updates: Partial<DashboardSnippetState>) => {
    setDashboardSnippets(prev => prev.map(s => s.title === title ? { ...s, ...updates } : s));
  }, []);

  // Mutations for AI features
  const lunchMutation = useMutation<SuggestTodaysLunchOutput, Error, SuggestTodaysLunchInput>({
    mutationFn: handleSuggestTodaysLunch,
    onSuccess: (data) => {
      updateSnippet("Today's Lunch Suggestion", { 
        description: `${data.suggestion}${data.recipeBrief ? ` - ${data.recipeBrief}` : ''}`, 
        isLoading: false, error: undefined 
      });
    },
    onError: (error) => {
      updateSnippet("Today's Lunch Suggestion", { description: "Could not fetch lunch idea.", isLoading: false, error: error.message });
      toast({ variant: "destructive", title: "Lunch Suggestion Error", description: error.message });
    },
  });

  const shoppingListMutation = useMutation<GenerateQuickShoppingListOutput, Error, GenerateQuickShoppingListInput>({
    mutationFn: handleGenerateQuickShoppingList,
    onSuccess: (data) => {
      const itemsText = data.items && data.items.length > 0 ? `Remember to pick up: ${data.items.join(", ")}.` : "No specific items suggested right now. Plan a meal to get a full list!";
      updateSnippet("Shopping List Quick View", { description: itemsText, isLoading: false, error: undefined });
    },
    onError: (error) => {
      updateSnippet("Shopping List Quick View", { description: "Could not fetch shopping list items.", isLoading: false, error: error.message });
      toast({ variant: "destructive", title: "Shopping List Error", description: error.message });
    },
  });

  const progressMessageMutation = useMutation<GenerateProgressSnapshotMessageOutput, Error, GenerateProgressSnapshotMessageInput>({
    mutationFn: handleGenerateProgressMessage,
    onSuccess: (data) => {
      updateSnippet("Your Progress Snapshot", { description: data.message, isLoading: false, error: undefined });
    },
    onError: (error) => {
      updateSnippet("Your Progress Snapshot", { description: "Could not fetch progress update.", isLoading: false, error: error.message });
      toast({ variant: "destructive", title: "Progress Snapshot Error", description: error.message });
    },
  });

  const calculateMealLogStreak = useCallback((): number => {
    if (!symptomLogs || symptomLogs.length === 0) return 0;

    const uniqueLogDates = Array.from(new Set(symptomLogs.map(log => new Date(log.logTime).toDateString()))).map(dateStr => new Date(dateStr));
    uniqueLogDates.sort((a, b) => a.getTime() - b.getTime());

    if (uniqueLogDates.length === 0) return 0;

    let currentStreak = 0;
    let expectedDate = new Date(uniqueLogDates[uniqueLogDates.length -1]); // Start from the last log date

     // Check if the last log date is today or yesterday to start the streak from there
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (expectedDate.toDateString() !== today.toDateString() && expectedDate.toDateString() !== yesterday.toDateString()) {
        // If the last log isn't today or yesterday, streak is 0 unless we count historical streaks.
        // For a "current streak ending now or yesterday"
        return 0;
    }


    for (let i = uniqueLogDates.length - 1; i >= 0; i--) {
        if (uniqueLogDates[i].toDateString() === expectedDate.toDateString()) {
            currentStreak++;
            expectedDate.setDate(expectedDate.getDate() - 1); // Expect the previous day
        } else if (uniqueLogDates[i] < expectedDate) {
             // There's a gap, so the streak ended before this log.
             // However, if we started from today/yesterday, this means the consecutive streak broke earlier.
            break;
        }
        // If uniqueLogDates[i] is > expectedDate, it means there's a duplicate or non-sequential log, skip it.
    }
    return currentStreak;
  }, [symptomLogs]);


  const fetchDashboardData = useCallback(() => {
    if (!authUser) return;

    // Reset loading states
    updateSnippet("Today's Lunch Suggestion", { isLoading: true, error: undefined, description: "Thinking of a healthy lunch for you..." });
    updateSnippet("Shopping List Quick View", { isLoading: true, error: undefined, description: "Generating a few essentials for you..." });
    updateSnippet("Your Progress Snapshot", { isLoading: true, error: undefined, description: "Checking your latest progress..." });
    
    lunchMutation.mutate({
      dietaryPreferences: userDetails?.dietaryRestrictions ? Object.entries(userDetails.dietaryRestrictions)
        .filter(([, value]) => value)
        .map(([key]) => key.replace(/([A-Z])/g, ' $1').toLowerCase()) // e.g. glutenFree -> gluten free
        .join(', ') + (userDetails.dietaryRestrictions.other ? `, ${userDetails.dietaryRestrictions.other}` : '') : undefined,
      healthGoals: userDetails?.primaryHealthGoal,
    });

    shoppingListMutation.mutate({ healthGoal: userDetails?.primaryHealthGoal });
    
    const streak = calculateMealLogStreak();
    progressMessageMutation.mutate({ mealLogStreak: streak, userName: authUser.username });

  }, [authUser, userDetails, lunchMutation, shoppingListMutation, progressMessageMutation, calculateMealLogStreak, updateSnippet]);

  useEffect(() => {
    if(isClient && authUser){
      fetchDashboardData();
    }
  }, [isClient, authUser, fetchDashboardData]); // Removed userDetails from dependencies, let fetchDashboardData handle it

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
      link: "/meal-plan", 
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
      description: "Share recipes, success stories, and join group challenges with fellow Nutri AI users. (Coming Soon)",
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


  return (
    <div className="flex flex-col items-center space-y-8 md:space-y-12 w-full">
      <header className="text-center space-y-4 pt-4 md:pt-0">
        <Leaf className="mx-auto h-12 w-12 md:h-16 md:w-16 text-primary" />
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
          Welcome to Nutri AI
        </h1>
        <p className="text-md md:text-xl text-muted-foreground max-w-3xl">
          Your intelligent partner for highly personalized nutrition. Achieve your health goals with AI-driven dietary analysis, custom meal plans, interactive coaching, and smart recipe suggestions.
        </p>
      </header>

      <section aria-labelledby="dashboard-heading" className="w-full max-w-7xl px-2 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h2 id="dashboard-heading" className="text-2xl md:text-3xl font-semibold text-foreground">Your At-a-Glance Dashboard</h2>
          <Button variant="ghost" size="icon" onClick={fetchDashboardData} disabled={!authUser || lunchMutation.isPending || shoppingListMutation.isPending || progressMessageMutation.isPending} aria-label="Refresh dashboard">
            <RefreshCw className={`h-5 w-5 ${ (lunchMutation.isPending || shoppingListMutation.isPending || progressMessageMutation.isPending) ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {dashboardSnippets.map((snippet) => (
            <Card key={snippet.title} className="flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-1">
                  <snippet.icon aria-hidden="true" className="h-6 w-6 md:h-7 md:w-7 text-accent" />
                  <CardTitle className="text-lg md:text-xl">{snippet.title}</CardTitle>
                </div>
                {snippet.isLoading ? (
                  <div className="space-y-2 h-16">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : snippet.error ? (
                   <Alert variant="destructive" className="h-16 text-xs p-2">
                      <Terminal className="h-3 w-3" />
                      <AlertTitle className="text-xs font-semibold">Error</AlertTitle>
                      <AlertDescription className="truncate">{snippet.error}</AlertDescription>
                   </Alert>
                ) : (
                  <CardDescription className="text-card-foreground/80 h-16 text-sm overflow-hidden">
                    {snippet.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="mt-auto">
                <Link href={snippet.link} passHref>
                  <Button variant="outline" size="sm" className="w-full text-xs md:text-sm" disabled={snippet.isLoading}>
                    {snippet.cta}
                    <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
         {!authUser && isClient && (
            <p className="text-center mt-6 text-sm text-muted-foreground">
                Please <Link href="/sign-in" className="text-primary hover:underline">sign in</Link> to see your personalized dashboard.
            </p>
        )}
      </section>

      <section aria-labelledby="features-heading" className="w-full max-w-7xl px-2 sm:px-0">
        <h2 id="features-heading" className="text-2xl md:text-3xl font-semibold mb-8 text-center text-foreground pt-8">Explore Nutri AI Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <Card key={feature.title} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card">
              <div className="relative h-40 md:h-48 w-full">
                <Image
                  src={feature.image}
                  alt={`${feature.title} visual representation`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  data-ai-hint={feature.aiHint}
                  priority={index < 3}
                />
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-2">
                  <feature.icon aria-hidden="true" className="h-7 w-7 md:h-8 md:w-8 text-accent" />
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
                    <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="how-it-works-heading" className="w-full max-w-4xl text-center py-8 md:py-12 px-2 sm:px-0">
        <h2 id="how-it-works-heading" className="text-2xl md:text-3xl font-semibold mb-6 text-foreground">How Nutri AI Elevates Your Journey</h2>
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
