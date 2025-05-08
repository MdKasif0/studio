import { SymptomLogForm } from "@/components/forms/SymptomLogForm";
import { ProgressCharts } from "@/components/display/ProgressCharts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, BarChart3, FilePlus2, ShieldAlert } from "lucide-react";

export default function ProgressTrackingPage() {
  return (
    <div className="container mx-auto py-8 space-y-12">
      <header className="text-center">
        <BarChart3 className="mx-auto h-16 w-16 text-accent mb-4" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Track Your Progress & Well-being</h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
          Monitor your journey, log symptoms, and visualize your achievements. Understanding your progress helps refine your path to wellness.
        </p>
      </header>

      <Alert variant="destructive" className="max-w-3xl mx-auto bg-destructive/10 border-destructive/50 text-destructive [&>svg]:text-destructive">
        <ShieldAlert className="h-5 w-5" />
        <AlertTitle className="font-semibold">Important Disclaimer</AlertTitle>
        <AlertDescription>
          NutriCoach AI is designed for informational and educational purposes only. It is not a medical tool and should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider regarding any health concerns or before making any decisions related to your health or treatment.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <FilePlus2 className="h-7 w-7 text-primary" />
              <CardTitle className="text-2xl">Log Post-Meal Feelings</CardTitle>
            </div>
            <CardDescription>
              Note how you feel after meals to help identify patterns or potential sensitivities. This feature is in early development.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SymptomLogForm />
          </CardContent>
        </Card>

        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Activity className="h-7 w-7 text-primary" />
              <CardTitle className="text-2xl">Progress Overview</CardTitle>
            </div>
            <CardDescription>
              Visualize your nutritional intake, adherence, and other metrics. Charts and detailed stats are coming soon!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProgressCharts />
          </CardContent>
        </Card>
      </div>
       <p className="text-center mt-8 text-sm text-muted-foreground">
          Full progress tracking and visualization features are under active development.
        </p>
    </div>
  );
}
