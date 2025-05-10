"use client";

import React, { useState, useEffect } from 'react'; // Added useState, useEffect
import { useMutation, useQueryClient } from "@tanstack/react-query"; // Added useQueryClient
import { SymptomLogForm } from "@/components/forms/SymptomLogForm";
import { ProgressCharts } from "@/components/display/ProgressCharts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, BarChart3, FilePlus2, ShieldAlert, Terminal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { handleLogSymptom } from "@/lib/actions";
import type { SymptomLogFormValues } from "@/lib/schemas/appSchemas";
import { getAuthUser, saveSymptomLog, type AuthUser } from "@/lib/authLocalStorage"; // Added getAuthUser, saveSymptomLog, AuthUser

export default function ProgressTrackingPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient(); // For potential cache invalidation/refetch
  const [defaultLogTime, setDefaultLogTime] = React.useState<string | undefined>(undefined);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    // Set default log time for the form when component mounts on client
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - (offset * 60 * 1000));
    setDefaultLogTime(localDate.toISOString().slice(0, 16));
    setAuthUser(getAuthUser());
  }, []);

  const symptomLogMutation = useMutation({
    mutationFn: handleLogSymptom, // Server action
    onSuccess: (data, variables) => { // variables = SymptomLogFormValues submitted
      toast({
        title: "Symptoms Logged",
        description: data.message, // Message from server action
      });
      if (data.success && authUser) {
        saveSymptomLog(authUser.id, variables); // Save to local storage on client
        queryClient.invalidateQueries({ queryKey: ['symptomLogs', authUser.id] }); // Invalidate queries for ProgressCharts
      }
      // Reset form default time for next entry
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
              initialDateTime={defaultLogTime} // Pass this to set form's default time
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

