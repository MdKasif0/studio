
import type { AnalyzeDietaryHabitsOutput } from "@/ai/flows/analyze-dietary-habits";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2 } from "lucide-react";

interface DietaryAnalysisDisplayProps {
  data: AnalyzeDietaryHabitsOutput;
}

export function DietaryAnalysisDisplay({ data }: DietaryAnalysisDisplayProps) {
  return (
    <div className="space-y-6 mt-8">
      <Card className="shadow-lg" data-ai-hint="cache results">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Personalized Insights</CardTitle>
          <CardDescription>Understanding your current dietary patterns.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            <p className="whitespace-pre-wrap text-card-foreground/90">{data.insights}</p>
          </ScrollArea>
        </CardContent>
      </Card>
      <Card className="shadow-lg" data-ai-hint="cache results">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Dietary Recommendations</CardTitle>
          <CardDescription>Actionable steps towards your health goals.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            <p className="whitespace-pre-wrap text-card-foreground/90">{data.recommendations}</p>
          </ScrollArea>
        </CardContent>
      </Card>
      {data.nutritionTips && data.nutritionTips.length > 0 && (
        <Card className="shadow-lg" data-ai-hint="cache results">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Bonus Nutrition Tips</CardTitle>
            <CardDescription>Extra advice to support your journey.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.nutritionTips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-1 shrink-0" />
                  <span className="text-card-foreground/90">{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

