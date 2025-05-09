
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
import { Terminal, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";

// Note: For client components, metadata should be exported from the nearest server component parent (e.g. layout.tsx)
// or handled through client-side updates if truly dynamic and client-only.
// For static titles/descriptions on client pages, it's better to set them in a parent server component or use a dynamic metadata generation strategy.
// However, placing a static export here demonstrates the intent for SEO.
// In a real App Router setup, this static metadata might be better in a route group layout or page.tsx if this were a server component.
// For now, this is illustrative. A better approach for client pages might be a dynamic title update via useEffect.

// export const metadata: Metadata = { // This won't work directly in a "use client" component.
//   title: "Dietary Analysis - Personalized Insights | Nutri AI",
//   description: "Get a personalized dietary analysis from Nutri AI. Understand your eating habits, restrictions, and preferences to achieve your health goals.",
// };


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
    <div className="container mx-auto w-full md:max-w-3xl py-2 md:py-8"> {/* Adjusted padding and width */}
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
