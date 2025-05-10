
"use client";

import React, { useState, useEffect } from 'react'; 
import { useMutation, useQueryClient } from "@tanstack/react-query"; 
import { SymptomLogForm } from "@/components/forms/SymptomLogForm";
import { ProgressCharts } from "@/components/display/ProgressCharts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, BarChart3, FilePlus2, ShieldAlert, Terminal, Sparkles, BadgeCheck, MessageCircleQuestion } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { handleLogSymptom } from "@/lib/actions";
import type { SymptomLogFormValues } from "@/lib/schemas/appSchemas";
import { 
  getAuthUser, 
  saveSymptomLog, 
  type AuthUser,
  getDailyStreakData,
  saveDailyStreakData,
  addUnlockedBadge,
  getUnlockedBadges,
  getSymptomLogs
} from "@/lib/authLocalStorage"; 
import { format, subDays, isSameDay, parseISO } from 'date-fns';

const NUTRITION_FUN_FACTS = [
  "Avocados are fruits, not vegetables!",
  "Broccoli contains more vitamin C than oranges.",
  "Almonds are a member of the peach family.",
  "Honey never spoils.",
  "An apple a day might keep the doctor away, but good hydration is key too!",
  "Quinoa is a complete protein, containing all nine essential amino acids.",
  "Dark chocolate (70% cocoa or higher) is rich in antioxidants.",
  "Bell peppers have different nutrient profiles based on their color.",
  "Oats can help lower cholesterol levels.",
  "Eating a variety of colorful fruits and vegetables ensures a wide range of nutrients."
];

const BADGES = {
  LOG_MASTER_5: { name: "Log Master (5)", icon: BadgeCheck, description: "Logged 5 meals!" },
  CONSISTENCY_CRUSADER_3: { name: "Consistency Crusader (3 Day Streak)", icon: Sparkles, description: "Logged meals 3 days in a row!"}
};


export default function ProgressTrackingPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient(); 
  const [defaultLogTime, setDefaultLogTime] = React.useState<string | undefined>(undefined);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - (offset * 60 * 1000));
    setDefaultLogTime(localDate.toISOString().slice(0, 16));
    setAuthUser(getAuthUser());
  }, []);

  const updateDailyStreak = (userId: string) => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    
    let streakData = getDailyStreakData(userId);
    
    if (streakData.lastLogDate === todayStr) {
      // Already logged today, streak doesn't change
    } else {
      const yesterday = subDays(today, 1);
      const yesterdayStr = format(yesterday, 'yyyy-MM-dd');
      
      if (streakData.lastLogDate === yesterdayStr) {
        streakData.currentStreak += 1;
      } else {
        streakData.currentStreak = 1; // Reset streak
      }
      streakData.lastLogDate = todayStr;
    }
    
    saveDailyStreakData(userId, streakData);

    // Check for streak-based badges
    if (streakData.currentStreak >= 3) {
      const unlockedBadges = getUnlockedBadges(userId);
      if (!unlockedBadges.includes(BADGES.CONSISTENCY_CRUSADER_3.name)) {
        addUnlockedBadge(userId, BADGES.CONSISTENCY_CRUSADER_3.name);
        toast({
          title: "Badge Unlocked!",
          description: (
            <div className="flex items-center">
              <BADGES.CONSISTENCY_CRUSADER_3.icon className="h-5 w-5 mr-2 text-accent" />
              <span>{BADGES.CONSISTENCY_CRUSADER_3.description}</span>
            </div>
          ),
          duration: 5000,
        });
      }
    }
    return streakData;
  };

  const showFunFact = () => {
    const randomFact = NUTRITION_FUN_FACTS[Math.floor(Math.random() * NUTRITION_FUN_FACTS.length)];
    toast({
      title: (
        <div className="flex items-center">
          <MessageCircleQuestion className="h-5 w-5 mr-2 text-primary" />
          <span>Nutrition Fun Fact!</span>
        </div>
      ),
      description: randomFact,
      duration: 7000,
    });
  };

  const checkMicroRewards = (userId: string) => {
    const logs = getSymptomLogs(userId);
    const unlockedBadges = getUnlockedBadges(userId);

    if (logs.length >= 5 && !unlockedBadges.includes(BADGES.LOG_MASTER_5.name)) {
      addUnlockedBadge(userId, BADGES.LOG_MASTER_5.name);
      toast({
        title: "Badge Unlocked!",
        description: (
          <div className="flex items-center">
            <BADGES.LOG_MASTER_5.icon className="h-5 w-5 mr-2 text-accent" />
            <span>{BADGES.LOG_MASTER_5.description}</span>
          </div>
        ),
        duration: 5000,
      });
    }
  };


  const symptomLogMutation = useMutation({
    mutationFn: handleLogSymptom, 
    onSuccess: (data, variables) => { 
      toast({
        title: "Symptoms Logged",
        description: data.message, 
      });
      if (data.success && authUser) {
        saveSymptomLog(authUser.id, variables); 
        updateDailyStreak(authUser.id);
        showFunFact();
        checkMicroRewards(authUser.id);
        queryClient.invalidateQueries({ queryKey: ['symptomLogs', authUser.id] }); 
      }
      const now = new Date();
      const offset = now.getTimezoneOffset();
      const localDate = new Date(now.getTime() - (offset * 60 * 1000));
      setDefaultLogTime(localDate.toISOString().slice(0, 16));
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Logging Failed",
        description: error.message || "Could not log symptoms.",
      });
    },
  });

  const onSymptomSubmit = (data: SymptomLogFormValues) => {
    if (!authUser) {
      toast({ variant: "destructive", title: "Not Authenticated", description: "Please log in to log symptoms." });
      return;
    }
    symptomLogMutation.mutate(data);
  };

  return (
    <div className="container mx-auto py-4 md:py-8 space-y-8 md:space-y-12">
      <header className="text-center">
        <BarChart3 className="mx-auto h-12 w-12 md:h-16 md:w-16 text-accent mb-3 md:mb-4" />
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Track Your Progress & Well-being</h1>
        <p className="mt-2 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Monitor your journey, log symptoms, and visualize your achievements. Understanding your progress helps refine your path to wellness.
        </p>
      </header>

      <Alert variant="destructive" className="max-w-3xl mx-auto bg-destructive/10 border-destructive/50 text-destructive [&>svg]:text-destructive">
        <ShieldAlert className="h-5 w-5" />
        <AlertTitle className="font-semibold text-base md:text-lg">Important Disclaimer</AlertTitle>
        <AlertDescription className="text-sm md:text-base">
          Nutri AI is designed for informational and educational purposes only. It is not a medical tool and should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider regarding any health concerns or before making any decisions related to your health or treatment.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <Card className="shadow-xl">
          <CardHeader className="p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3">
              <FilePlus2 className="h-6 w-6 md:h-7 md:w-7 text-primary" />
              <CardTitle className="text-xl md:text-2xl">Log Post-Meal Feelings</CardTitle>
            </div>
            <CardDescription className="text-sm md:text-base">
              Note how you feel after meals to help identify patterns or potential sensitivities. This feature is in early development.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            {symptomLogMutation.isError && (
                <Alert variant="destructive" className="mb-4">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    {symptomLogMutation.error instanceof Error ? symptomLogMutation.error.message : "An unknown error occurred."}
                  </AlertDescription>
                </Alert>
            )}
            <SymptomLogForm 
              onSubmit={onSymptomSubmit} 
              isPending={symptomLogMutation.isPending}
              initialDateTime={defaultLogTime} 
            />
          </CardContent>
        </Card>

        <Card className="shadow-xl">
          <CardHeader className="p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3">
              <Activity className="h-6 w-6 md:h-7 md:w-7 text-primary" />
              <CardTitle className="text-xl md:text-2xl">Progress Overview</CardTitle>
            </div>
            <CardDescription className="text-sm md:text-base">
              Visualize your nutritional intake, adherence, and other metrics. Charts and detailed stats are coming soon!
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            {authUser && <ProgressCharts userId={authUser.id} />}
            {!authUser && <p className="text-muted-foreground text-center">Login to see your progress charts.</p>}
          </CardContent>
        </Card>
      </div>
       <p className="text-center mt-4 md:mt-8 text-xs md:text-sm text-muted-foreground">
          Full progress tracking and visualization features are under active development.
        </p>
    </div>
  );
}

