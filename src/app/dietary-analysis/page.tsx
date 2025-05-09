
"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { DietaryAnalysisForm } from "@/components/forms/DietaryAnalysisForm";
import { DietaryAnalysisDisplay } from "@/components/display/DietaryAnalysisDisplay";
import { handleDietaryAnalysis } from "@/lib/actions";
import type {
  AnalyzeDietaryHabitsInput,
  AnalyzeDietaryHabitsOutput,
} from "@/ai/flows/analyze-dietary-habits";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthUser, getApiKey } from "@/lib/authLocalStorage";
import type { AuthUser } from "@/lib/authLocalStorage";

export default function DietaryAnalysisPage() {
  const { toast } = useToast();
  const [analysisResult, setAnalysisResult] = useState<AnalyzeDietaryHabitsOutput | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setAuthUser(getAuthUser());
  }, []);

  const mutation = useMutation<AnalyzeDietaryHabitsOutput, Error, AnalyzeDietaryHabitsInput>({
    mutationFn: (data: AnalyzeDietaryHabitsInput) => handleDietaryAnalysis(data),
    onSuccess: (data) => {
      setAnalysisResult(data);
      toast({
        title: "Analysis Complete!",
        description: "Your dietary habits have been analyzed.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error.message || "An unexpected error occurred.",
      });
      setAnalysisResult(null);
    },
  });

  const handleSubmit = async (formData: Omit<AnalyzeDietaryHabitsInput, 'apiKey'>) => {
    const userApiKey = authUser ? getApiKey(authUser.id) : null;
    const submissionData: AnalyzeDietaryHabitsInput = {
      ...formData,
      ...(userApiKey && { apiKey: userApiKey }),
    };
    mutation.mutate(submissionData);
  };

  return (
    <div className="container mx-auto w-full md:max-w-3xl py-2 md:py-8">
      <Card className="shadow-xl">
        <CardHeader className="px-4 pt-4 md:px-6 md:pt-6">
           <div className="flex items-center gap-2 md:gap-3 mb-2">
            <FileText className="h-7 w-7 md:h-8 md:w-8 text-accent" />
            <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight">Personalized Dietary Analysis</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground text-sm md:text-base">
            Gain insights into your eating habits. Fill out the form below, and our AI will provide personalized feedback and recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
          <DietaryAnalysisForm
            onSubmit={handleSubmit}
            isPending={mutation.isPending}
          />
          {mutation.isError && (
            <Alert variant="destructive" className="mt-6 md:mt-8">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {mutation.error instanceof Error ? mutation.error.message : "An unknown error occurred."}
              </AlertDescription>
            </Alert>
          )}
          {analysisResult && <DietaryAnalysisDisplay data={analysisResult} />}
        </CardContent>
      </Card>
    </div>
  );
}
