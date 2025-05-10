"use client";

import { useState, useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { MealPlanForm } from "@/components/forms/MealPlanForm";
import { MealPlanDisplay } from "@/components/display/MealPlanDisplay";
import { handleMealPlanGeneration } from "@/lib/actions";
import type {
  GenerateCustomMealPlanInput,
  GenerateCustomMealPlanOutput,
} from "@/ai/flows/generate-custom-meal-plan";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, CalendarDays, WifiOff, Loader2, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  getAuthUser, 
  getApiKey, 
  saveCachedMealPlan, 
  getCachedMealPlan,
  type AuthUser 
} from "@/lib/authLocalStorage";

export default function MealPlanPage() {
  const { toast } = useToast();
  const [mealPlanResult, setMealPlanResult] = useState<GenerateCustomMealPlanOutput | null>(null);
  const [cachedMealPlan, setCachedMealPlan] = useState<GenerateCustomMealPlanOutput | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isLoadingCache, setIsLoadingCache] = useState(true); // For initial cache check

  useEffect(() => {
    const user = getAuthUser();
    setAuthUser(user);
    setIsLoadingCache(true);
    if (user) {
      const storedPlan = getCachedMealPlan(user.id);
      if (storedPlan) {
        setCachedMealPlan(storedPlan);
      }
    }
    setIsLoadingCache(false);

    // Handle initial offline status
    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);

      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  const mutation = useMutation<GenerateCustomMealPlanOutput, Error, GenerateCustomMealPlanInput>({
    mutationFn: (data: GenerateCustomMealPlanInput) => handleMealPlanGeneration(data),
    onSuccess: (data, variables) => {
      setMealPlanResult(data);
      if (authUser) {
        saveCachedMealPlan(authUser.id, data);
        setCachedMealPlan(data); // Also update the cachedMealPlan state immediately
      }
      toast({
        title: "Meal Plan Generated!",
        description: "Your custom meal plan is ready.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Meal Plan Generation Failed",
        description: `${error.message || "An unexpected error occurred."}${cachedMealPlan ? " Displaying last saved plan." : ""}`,
      });
      // Do not clear mealPlanResult here, so if there was a cached one it can still be shown
      // If an error occurs, mealPlanResult will be null from the handleSubmit reset,
      // so `displayedPlan` will naturally fall back to `cachedMealPlan`.
    },
  });

  const handleSubmit = async (formData: Omit<GenerateCustomMealPlanInput, 'apiKey'>) => {
    if (isOffline) {
      toast({
        variant: "destructive",
        title: "You are offline",
        description: "Cannot generate a new meal plan. Please check your internet connection.",
      });
      return;
    }
    if (!authUser) {
      toast({ variant: "destructive", title: "Not Authenticated", description: "Please log in to generate a meal plan." });
      return;
    }

    const userApiKey = getApiKey(authUser.id);
    const submissionData: GenerateCustomMealPlanInput = {
      ...formData,
      ...(userApiKey && { apiKey: userApiKey }),
    };
    setMealPlanResult(null); // Clear previous fresh result before new generation
    mutation.mutate(submissionData);
  };

  const displayedPlan = mealPlanResult || cachedMealPlan;

  if (isLoadingCache && typeof window !== 'undefined') { // Added check for window for SSR
    return (
      <div className="container mx-auto w-full md:max-w-3xl py-2 md:py-8 flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="ml-4 text-muted-foreground">Loading your meal planner...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto w-full md:max-w-3xl py-2 md:py-8">
      <Card className="shadow-xl animate-in fade-in duration-500">
        <CardHeader className="px-4 pt-4 md:px-6 md:pt-6">
          <div className="flex items-center gap-2 md:gap-3 mb-2">
            <CalendarDays className="h-7 w-7 md:h-8 md:w-8 text-accent" />
            <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight">Custom Meal Plan Generator</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground text-sm md:text-base">
            Tell us your needs, and our AI will craft a personalized meal plan for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
          {isOffline && (
            <Alert variant="default" className="mb-6 bg-amber-50 border-amber-300 text-amber-700 [&>svg]:text-amber-600">
              <WifiOff className="h-4 w-4" />
              <AlertTitle>You are currently offline.</AlertTitle>
              <AlertDescription>
                New meal plans cannot be generated. {cachedMealPlan ? "Displaying your last saved meal plan." : "Please connect to the internet to generate a plan."}
              </AlertDescription>
            </Alert>
          )}
          <MealPlanForm
            onSubmit={handleSubmit}
            isPending={mutation.isPending}
          />
          {mutation.isError && !isOffline && ( 
             <Alert variant="destructive" className="mt-6 md:mt-8">
             <Terminal className="h-4 w-4" />
             <AlertTitle>Error Generating Plan</AlertTitle>
             <AlertDescription>
                {mutation.error instanceof Error ? mutation.error.message : "An unknown error occurred."}
                {cachedMealPlan && " Displaying your last successfully generated plan."}
             </AlertDescription>
           </Alert>
          )}
          {displayedPlan && <MealPlanDisplay data={displayedPlan} />}
          {!displayedPlan && !mutation.isPending && !isLoadingCache && (
            <Alert variant="default" className="mt-8 bg-blue-50 border-blue-300 text-blue-700 [&>svg]:text-blue-600">
              <Info className="h-4 w-4" />
              <AlertTitle>No Meal Plan Yet</AlertTitle>
              <AlertDescription>
                {isOffline ? "You are offline. Please connect to the internet to generate a meal plan." : "Fill out the form above to generate your personalized meal plan!"}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
