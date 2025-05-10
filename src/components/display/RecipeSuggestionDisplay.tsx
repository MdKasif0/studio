
import type { SuggestRecipeAlternativesOutput } from "@/ai/flows/suggest-recipe-alternatives";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RecipeSuggestionDisplayProps {
  data: SuggestRecipeAlternativesOutput;
}

export function RecipeSuggestionDisplay({ data }: RecipeSuggestionDisplayProps) {
  return (
    <Card className="mt-8 shadow-lg" data-ai-hint="cache results">
      <CardHeader>
        <CardTitle className="text-2xl">Recipe Alternatives</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72 max-h-[60vh]"> {/* Adjusted height */}
           <p className="whitespace-pre-wrap text-card-foreground/90">{data.alternatives}</p>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

