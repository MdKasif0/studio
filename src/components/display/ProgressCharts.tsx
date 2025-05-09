
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, PieChartIcon, TrendingUp, Info } from "lucide-react"; // Changed PieChart to PieChartIcon
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Pie, Cell, Bar as RechartsBar, ResponsiveContainer, BarChart as RechartsBarChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend as RechartsLegend, PieChart as RechartsPieChart } from "recharts";
import React from "react";
import type { SymptomLogEntry } from "@/lib/authLocalStorage";
import { Alert, AlertDescription } from "@/components/ui/alert";


interface ProgressChartsProps {
  symptomLogs: SymptomLogEntry[];
  isLoading: boolean;
}

// Placeholder data for charts not yet fully implemented with dynamic data
const sampleCalorieData = [
  { date: "Mon", planned: 2000, actual: 1950 },
  { date: "Tue", planned: 2000, actual: 2100 },
  { date: "Wed", planned: 1800, actual: 1850 },
  { date: "Thu", planned: 2000, actual: 1900 },
  { date: "Fri", planned: 2200, actual: 2150 },
  { date: "Sat", planned: 2200, actual: 2300 },
  { date: "Sun", planned: 2000, actual: 2050 },
];

const sampleMacroData = [
  { name: "Protein", value: 30, fillKey: "chart-1" }, // fillKey matches chartConfig keys
  { name: "Carbs", value: 45, fillKey: "chart-2" },
  { name: "Fats", value: 25, fillKey: "chart-4" },
];

const chartConfigBase = {
  planned: { label: "Planned Calories", color: "hsl(var(--chart-5))" },
  actual: { label: "Actual Calories", color: "hsl(var(--chart-1))" },
  protein: { label: "Protein", color: "hsl(var(--chart-1))" },
  carbs: { label: "Carbs", color: "hsl(var(--chart-2))" },
  fats: { label: "Fats", color: "hsl(var(--chart-4))" },
  energyLow: { label: "Low Energy", color: "hsl(var(--chart-3))" },
  energyMedium: { label: "Medium Energy", color: "hsl(var(--chart-2))" },
  energyHigh: { label: "High Energy", color: "hsl(var(--chart-1))" },
  energyUnchanged: { label: "Unchanged Energy", color: "hsl(var(--chart-5))" },
   // For sampleMacroData mapping
  "chart-1": { label: "Protein", color: "hsl(var(--chart-1))" },
  "chart-2": { label: "Carbs", color: "hsl(var(--chart-2))" },
  "chart-4": { label: "Fats", color: "hsl(var(--chart-4))" },
} satisfies import("@/components/ui/chart").ChartConfig;


export function ProgressCharts({ symptomLogs, isLoading }: ProgressChartsProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const energyLevelData = React.useMemo(() => {
    if (!symptomLogs || symptomLogs.length === 0) return [];
    const counts = { low: 0, medium: 0, high: 0, unchanged: 0 };
    symptomLogs.forEach(log => {
      if (log.energyLevel) {
        counts[log.energyLevel]++;
      }
    });
    return [
      { name: "Low", value: counts.low, fillKey: "energyLow" },
      { name: "Medium", value: counts.medium, fillKey: "energyMedium" },
      { name: "High", value: counts.high, fillKey: "energyHigh" },
      { name: "Unchanged", value: counts.unchanged, fillKey: "energyUnchanged" },
    ].filter(d => d.value > 0);
  }, [symptomLogs]);


  if (isLoading || !mounted) {
    return (
      <div className="space-y-4">
        <div className="h-64 bg-muted rounded-md animate-pulse flex items-center justify-center">
          <BarChart className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="h-64 bg-muted rounded-md animate-pulse flex items-center justify-center">
          <PieChartIcon className="h-12 w-12 text-muted-foreground" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><TrendingUp className="h-5 w-5 mr-2 text-primary" />Calorie Intake (Last 7 Days)</CardTitle>
          <CardDescription>Planned vs. Actual calorie consumption.</CardDescription>
           <Alert variant="default" className="mt-2 text-xs bg-primary/10 border-primary/30">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-primary/90">
              This chart currently displays sample data. Full calorie tracking from meal logs is coming soon!
            </AlertDescription>
          </Alert>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfigBase} className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={sampleCalorieData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <RechartsTooltip 
                  content={<ChartTooltipContent />} 
                  cursor={{ fill: 'hsl(var(--muted))', radius: 4 }}
                />
                <RechartsLegend content={<ChartLegendContent />} />
                <RechartsBar dataKey="planned" fill="var(--color-planned)" radius={4} />
                <RechartsBar dataKey="actual" fill="var(--color-actual)" radius={4} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><PieChartIcon className="h-5 w-5 mr-2 text-primary" />Energy Levels Post-Meal</CardTitle>
          <CardDescription>Distribution of your logged energy levels after meals.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          {energyLevelData.length > 0 ? (
            <ChartContainer config={chartConfigBase} className="h-64 w-full max-w-xs">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <RechartsTooltip 
                    content={<ChartTooltipContent hideLabel nameKey="name" />} // nameKey should match data structure
                  />
                  <Pie data={energyLevelData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {energyLevelData.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={`var(--color-${entry.fillKey})`} />
                    ))}
                  </Pie>
                  <RechartsLegend 
                      content={<ChartLegendContent nameKey="name"/>} 
                      payload={energyLevelData.map(entry => ({ value: entry.name, type: 'square', color: `var(--color-${entry.fillKey})` }))}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <p className="text-muted-foreground text-center py-10">No energy level data logged yet. Start logging your symptoms to see this chart!</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><PieChartIcon className="h-5 w-5 mr-2 text-primary" />Average Macronutrient Distribution</CardTitle>
          <CardDescription>Typical breakdown of your macronutrients.</CardDescription>
           <Alert variant="default" className="mt-2 text-xs bg-primary/10 border-primary/30">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-primary/90">
              This chart currently displays sample data. Full macronutrient tracking from meal logs is coming soon!
            </AlertDescription>
          </Alert>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ChartContainer config={chartConfigBase} className="h-64 w-full max-w-xs">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <RechartsTooltip 
                  content={<ChartTooltipContent hideLabel nameKey="name" />}
                />
                <Pie data={sampleMacroData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {sampleMacroData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`var(--color-${entry.fillKey})`} />
                  ))}
                </Pie>
                 <RechartsLegend 
                    content={<ChartLegendContent nameKey="name" />} 
                    payload={sampleMacroData.map(entry => ({ value: entry.name, type: 'square', color: `var(--color-${entry.fillKey})` }))}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      <p className="text-center text-sm text-muted-foreground">More detailed charts and adherence tracking coming soon!</p>
    </div>
  );
}

