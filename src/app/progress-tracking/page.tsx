
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SymptomLogForm } from "@/components/forms/SymptomLogForm";
import { ProgressCharts } from "@/components/display/ProgressCharts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, BarChart3, FilePlus2, ShieldAlert, Terminal, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { handleLogSymptom } from "@/lib/actions";
import type { SymptomLogFormValues } from "@/lib/schemas/appSchemas";
import { getAuthUser, saveSymptomLog, getSymptomLogs, type AuthUser, type SymptomLogEntry } from "@/lib/authLocalStorage";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';


export default function ProgressTrackingPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [defaultLogTime, setDefaultLogTime] = React.useState<string | undefined>(undefined);

  const resetDefaultLogTime = useCallback(() => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - (offset * 60 * 1000));
    setDefaultLogTime(localDate.toISOString().slice(0, 16));
  }, []);

  useEffect(() => {
    const user = getAuthUser();
    setAuthUser(user);
    setIsLoadingAuth(false);
    resetDefaultLogTime();
  }, [resetDefaultLogTime]);

  const { data: symptomLogs, isLoading: isLoadingLogs } = useQuery<SymptomLogEntry[], Error>({
    queryKey: ['symptomLogs', authUser?.id],
    queryFn: () => {
      if (!authUser) return Promise.resolve([]);
      return Promise.resolve(getSymptomLogs(authUser.id));
    },
    enabled: !!authUser, // Only run query if authUser is available
  });


  const symptomLogMutation = useMutation({
    mutationFn: async (data: SymptomLogFormValues) => {
      // Simulate server action
      const response = await handleLogSymptom(data); 
      if (response.success && authUser) {
        saveSymptomLog(authUser.id, data); // Save to local storage on client
      }
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Symptoms Logged",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['symptomLogs', authUser?.id] }); // Refetch logs
      resetDefaultLogTime(); // Reset form default time for next entry
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
      toast({ variant: "destructive", title: "Error", description: "User not authenticated." });
      return;
    }
    symptomLogMutation.mutate(data);
  };

  if (isLoadingAuth) {
    return (
      <div className="container mx-auto py-8 text-center">
        <User className="mx-auto h-16 w-16 text-accent mb-4 animate-pulse" />
        <p className="text-muted-foreground">Loading user data...</p>
      </div>
    );
  }

  if (!authUser) {
     return (
      <div className="container mx-auto py-8 text-center">
        <User className="mx-auto h-16 w-16 text-destructive mb-4" />
        <p className="text-muted-foreground">Please log in to track your progress.</p>
        {/* Optionally add a login button here */}
      </div>
    );
  }

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
              Note how you feel after meals to help identify patterns or potential sensitivities.
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
              Visualize your nutritional intake, adherence, and logged feelings.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <ProgressCharts symptomLogs={symptomLogs || []} isLoading={isLoadingLogs} />
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-xl mt-8 md:mt-12">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">Recent Symptom Logs</CardTitle>
          <CardDescription>A quick view of your latest entries.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingLogs ? (
            <p className="text-muted-foreground">Loading logs...</p>
          ) : symptomLogs && symptomLogs.length > 0 ? (
            <ScrollArea className="h-64">
              <ul className="space-y-3">
                {symptomLogs.slice().reverse().map(log => ( // Show newest first
                  <li key={log.id} className="p-3 border rounded-md bg-muted/50">
                    <p className="font-semibold text-sm">{log.mealName}</p>
                    <p className="text-xs text-muted-foreground">
                      Logged: {format(new Date(log.logTime), "MMM d, yyyy HH:mm")}
                    </p>
                    {log.energyLevel && <p className="text-xs">Energy: <span className="capitalize">{log.energyLevel}</span></p>}
                    {log.mood && <p className="text-xs">Mood: {log.mood}</p>}
                    {log.digestiveSymptoms && <p className="text-xs">Digestion: {log.digestiveSymptoms}</p>}
                    {log.otherSymptoms && <p className="text-xs">Other: {log.otherSymptoms}</p>}
                    {log.notes && <p className="text-xs mt-1 italic">Notes: {log.notes}</p>}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          ) : (
            <p className="text-muted-foreground">No symptoms logged yet. Use the form above to start tracking!</p>
          )}
        </CardContent>
      </Card>

       <p className="text-center mt-4 md:mt-8 text-xs md:text-sm text-muted-foreground">
          Full progress tracking and visualization features are under active development. More charts coming soon!
        </p>
    </div>
  );
}

