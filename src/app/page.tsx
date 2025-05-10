"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Utensils, Replace, ArrowRight, Leaf, MessageSquareHeart, Award, Users, BookOpen, BarChart3, HeartHandshake, Apple, ShoppingCart, Activity, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getAuthUser, getUserDetails, getApiKey, type AuthUser, type StoredUserDetails, saveHomeDashboardData, getHomeDashboardData, type HomeDashboardCache } from "@/lib/authLocalStorage";
import { handleHomeDashboardUpdate } from "@/lib/actions";
import type { HomeDashboardInput, HomeDashboardOutput } from "@/ai/flows/home-dashboard-flow";
import { useToast } from "@/hooks/use-toast";
import { OnboardingDialog } from '@/components/onboarding/OnboardingDialog';


export default function HomePage() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [userDetails, setUserDetails] = useState<StoredUserDetails | null>(null);
  const [dashboardData, setDashboardData] = useState<HomeDashboardOutput | null>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const { toast } = useToast();
  const [showOnboarding, setShowOnboarding] = useState(false);

  const checkOnboardingStatus = useCallback(() => {
    const user = getAuthUser();
    setAuthUser(user);
    if (user) {
      const details = getUserDetails(user.id);
      setUserDetails(details);
      const onboardingComplete = localStorage.getItem(`onboardingComplete_${user.id}`);
      if (!onboardingComplete) {
        setShowOnboarding(true);
      } else {
        setShowOnboarding(false);
      }
    } else {
      setIsLoadingDashboard(false); 
      setDashboardData(null); 
      setShowOnboarding(false);
    }
  }, []);


  useEffect(() => {
    checkOnboardingStatus();
  }, [checkOnboardingStatus]);


  useEffect(() => {
    if (!authUser || showOnboarding) { 
      setIsLoadingDashboard(false);
      setDashboardData(null);
      return;
    }

    const fetchData = async () => {
      setIsLoadingDashboard(true);
      const cachedData = getHomeDashboardData(authUser.id);
      const now = new Date().getTime();

      if (cachedData && (now - cachedData.timestamp < 15 * 60 * 1000)) { 
        setDashboardData(cachedData.data);
        setIsLoadingDashboard(false);
        return;
      }

      try {
        const userApiKey = getApiKey(authUser.id);
        const currentLocalUserDetails = getUserDetails(authUser.id);
        
        if (JSON.stringify(currentLocalUserDetails) !== JSON.stringify(userDetails)) {
          setUserDetails(currentLocalUserDetails); 
        }


        const input: HomeDashboardInput = {
          userId: authUser.id,
          userProfile: {
            healthGoals: currentLocalUserDetails?.primaryHealthGoal || "general wellness",
            dietaryRestrictions: currentLocalUserDetails?.dietaryRestrictions ?
              Object.entries(currentLocalUserDetails.dietaryRestrictions)
                    .filter(([, value]) => value === true || (typeof value === 'string' && value.length > 0)) 
                    .map(([key, value]) => key === 'other' && typeof value === 'string' ? value : key)
                    .filter(Boolean) 
                    .join(', ')
              : "none",
          },
          currentDate: new Date().toISOString().split('T')[0],
          ...(userApiKey && { apiKey: userApiKey }),
        };
        
        if (!input.userProfile.dietaryRestrictions) {
            input.userProfile.dietaryRestrictions = "none";
        }

        const data = await handleHomeDashboardUpdate(input);
        setDashboardData(data);
        saveHomeDashboardData(authUser.id, data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        const errorMessage = error instanceof Error ? error.message : "Could not load dashboard data. The AI assistant might be unavailable.";
        
        // Check if already loading or if dashboard data is already set to avoid spamming toasts
        // This logic was simplified as it was too complex and potentially causing issues.
        // The toast will now show if an error occurs during fetch.
        toast({
            variant: "destructive",
            title: "Dashboard Error",
            description: errorMessage,
        });
        
        setDashboardData(cachedData ? cachedData.data : null);
      } finally {
        setIsLoadingDashboard(false);
      }
    };

    fetchData();
  }, [authUser, showOnboarding, userDetails, toast]); // Corrected dependency array

  const handleOnboardingComplete = () => {
    if (authUser) {
      localStorage.setItem(`onboardingComplete_${authUser.id}`, 'true');
    }
    setShowOnboarding(false);
    if(authUser) {
        const details = getUserDetails(authUser.id);
        setUserDetails(details); 
    }
  };


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

  const dashboardSnippets = [
    {
      icon: Apple,
      title: "Today's Lunch Suggestion",
      getData: (data: HomeDashboardOutput | null) => data?.lunchSuggestion || "No suggestion available.",
      link: "/meal-plan",
      cta: "View Full Meal Plan",
    },
    {
      icon: ShoppingCart,
      title: "Shopping List Quick View",
      getData: (data: HomeDashboardOutput | null) => data?.shoppingListPreview && data.shoppingListPreview.length > 0 ? data.shoppingListPreview.join(', ') : "No items in quick view.",
      link: "/meal-plan", 
      cta: "See Full List",
    },
    {
      icon: Activity,
      title: "Your Progress Snapshot",
      getData: (data: HomeDashboardOutput | null) => data?.progressSummary || "No progress summary yet.",
      link: "/progress-tracking",
      cta: "Track Details",
    },
    {
      icon: Users,
      title: "Community Highlights",
      getData: (data: HomeDashboardOutput | null) => data?.communityHighlight || "No new community highlights.",
      link: "/community",
      cta: "Visit Community",
    },
  ];

  return (
    <div className="flex flex-col items-center space-y-8 md:space-y-12 w-full">
      {showOnboarding && authUser && <OnboardingDialog user={authUser} onComplete={handleOnboardingComplete} />}
      <header className="text-center space-y-4 pt-4 md:pt-0">
        <Leaf className="mx-auto h-12 w-12 md:h-16 md:w-16 text-primary" />
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
          Welcome to Nutri AI{authUser ? `, ${authUser.username}!` : '!'}
        </h1>
        <p className="text-md md:text-xl text-muted-foreground max-w-3xl">
          Your intelligent partner for highly personalized nutrition. Achieve your health goals with AI-driven dietary analysis, custom meal plans, interactive coaching, and smart recipe suggestions.
        </p>
      </header>

      {!showOnboarding && (
        <section aria-labelledby="dashboard-heading" className="w-full max-w-7xl px-2 sm:px-0">
          <h2 id="dashboard-heading" className="text-2xl md:text-3xl font-semibold mb-6 text-center text-foreground">Your At-a-Glance Dashboard</h2>
          {isLoadingDashboard ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="flex flex-col overflow-hidden shadow-md bg-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3 mb-1 h-7">
                      <Loader2 className="h-6 w-6 text-accent animate-spin" />
                       <span className="text-lg md:text-xl w-3/4 h-6 bg-muted rounded animate-pulse"></span>
                    </div>
                     <div className="h-16 bg-muted rounded animate-pulse"></div>
                  </CardHeader>
                  <CardContent className="mt-auto">
                     <div className="h-9 w-full bg-muted rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : authUser && dashboardData ? ( 
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {dashboardSnippets.map((snippet) => (
                <Card key={snippet.title} className="flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 bg-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3 mb-1">
                      <snippet.icon aria-hidden="true" className="h-6 w-6 md:h-7 md:w-7 text-accent" />
                      <CardTitle className="text-lg md:text-xl">{snippet.title}</CardTitle>
                    </div>
                    <CardDescription className="text-card-foreground/80 h-16 text-sm">
                      {snippet.getData(dashboardData)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto">
                    <Link href={snippet.link} passHref>
                      <Button variant="outline" size="sm" className="w-full text-xs md:text-sm">
                        {snippet.cta}
                        <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : authUser && !dashboardData ? ( 
               <p className="text-center mt-6 text-md text-muted-foreground">
                  Could not load dashboard data. Please check your API key or try again later.
              </p>
          ) : ( 
              <p className="text-center mt-6 text-md text-muted-foreground">
                  Login to view your personalized dashboard.
              </p>
          )}
        </section>
      )}

      <section aria-labelledby="features-heading" className="w-full max-w-7xl px-2 sm:px-0">
        <h2 id="features-heading" className="text-2xl md:text-3xl font-semibold mb-8 text-center text-foreground pt-8">Explore Nutri AI Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature) => (
            <Card key={feature.title} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card">
              <div className="relative h-40 md:h-48 w-full">
                <Image
                  src={feature.image}
                  alt={`${feature.title} visual representation`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  data-ai-hint={feature.aiHint}
                  priority={features.indexOf(feature) < 3}
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
