
"use client";

import { useState } from "react";
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
import { Terminal } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DietaryAnalysisPage() {
  const { toast } = useToast();
  const [analysisResult, setAnalysisResult] = useState<AnalyzeDietaryHabitsOutput | null>(null);

  const mutation = useMutation({
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

  const handleSubmit = async (data: AnalyzeDietaryHabitsInput) => {
    mutation.mutate(data);
  };

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">Personalized Dietary Analysis</CardTitle>
          <CardDescription className="text-muted-foreground">
            Gain insights into your eating habits. Fill out the form below, and our AI will provide personalized feedback and recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DietaryAnalysisForm
            onSubmit={handleSubmit}
            isPending={mutation.isPending}
          />
          {mutation.isError && (
            <Alert variant="destructive" className="mt-8">
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
