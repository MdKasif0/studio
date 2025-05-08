
import type { AnalyzeDietaryHabitsOutput } from "@/ai/flows/analyze-dietary-habits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DietaryAnalysisDisplayProps {
  data: AnalyzeDietaryHabitsOutput;
}

export function DietaryAnalysisDisplay({ data }: DietaryAnalysisDisplayProps) {
  return (
    <div className="space-y-6 mt-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Personalized Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            <p className="whitespace-pre-wrap text-card-foreground/90">{data.insights}</p>
          </ScrollArea>
        </CardContent>
      </Card>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Dietary Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            <p className="whitespace-pre-wrap text-card-foreground/90">{data.recommendations}</p>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
