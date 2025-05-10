"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, PieChart, TrendingUp, Info } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Pie, Cell, Bar as RechartsBar, ResponsiveContainer, BarChart as RechartsBarChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend as RechartsLegend, PieChart as RechartsPieChart } from "recharts";
import React, { useEffect, useState } from "react";
import { getSymptomLogs, type SymptomLogEntry } from "@/lib/authLocalStorage"; // Import symptom log functions
import { Alert, AlertDescription } from "../ui/alert";
import { format, parseISO, startOfWeek, eachDayOfInterval, subDays } from 'date-fns';


interface ProgressChartsProps {
  userId: string;
}

const defaultCalorieData = [
  { date: "Mon", planned: 0, actual: 0 },
  { date: "Tue", planned: 0, actual: 0 },
  { date: "Wed", planned: 0, actual: 0 },
  { date: "Thu", planned: 0, actual: 0 },
  { date: "Fri", planned: 0, actual: 0 },
  { date: "Sat", planned: 0, actual: 0 },
  { date: "Sun", planned: 0, actual: 0 },
];

const defaultMacroData = [
  { name: "Low Energy", value: 0, fillKey: "chart-5" }, // Using chart-5 for low
  { name: "Medium Energy", value: 0, fillKey: "chart-2" }, // Using chart-2 for medium
  { name: "High Energy", value: 0, fillKey: "chart-1" },   // Using chart-1 for high
  { name: "Unchanged Energy", value: 0, fillKey: "chart-3" }, // Using chart-3 for unchanged
];


const chartConfig = {
  planned: { label: "Planned Calories (Sample)", color: "hsl(var(--chart-5))" }, // Label updated
  actual: { label: "Logged Meals (Count)", color: "hsl(var(--chart-1))" }, // Label updated for clarity
  "chart-1": { label: "High Energy", color: "hsl(var(--chart-1))" },
  "chart-2": { label: "Medium Energy", color: "hsl(var(--chart-2))" },
  "chart-3": { label: "Unchanged Energy", color: "hsl(var(--chart-3))" },
  "chart-4": { label: "Fats (Sample)", color: "hsl(var(--chart-4))" }, // Kept for full config, but not used by macroData
  "chart-5": { label: "Low Energy", color: "hsl(var(--chart-5))" },
} satisfies import("@/components/ui/chart").ChartConfig;


export function ProgressCharts({ userId }: ProgressChartsProps) {
  const [mounted, setMounted] = useState(false);
  const [calorieChartData, setCalorieChartData] = useState(defaultCalorieData);
  const [macroPieChartData, setMacroPieChartData] = useState(defaultMacroData);
  const [hasLogData, setHasLogData] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && userId) {
      const logs = getSymptomLogs(userId);
      setHasLogData(logs.length > 0);

      if (logs.length > 0) {
        // Process for Calorie Chart (Meal Log Count per Day of Week - Last 7 Days)
        const today = new Date();
        const N = 7; // Number of days to look back
        const lastNDays = Array.from({ length: N }, (_, i) => subDays(today, i)).reverse();

        const dailyMealCounts = lastNDays.map(day => {
            const dayStr = format(day, 'EEE'); // Mon, Tue, etc.
            const count = logs.filter(log => format(parseISO(log.logTime), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')).length;
            return { date: dayStr, actual: count, planned: 0 }; // 'planned' is just a placeholder here
        });
        setCalorieChartData(dailyMealCounts);
        
        // Process for Macro Pie Chart (Energy Levels from latest 10 logs)
        const recentLogs = logs.slice(0, 10); // Get up to 10 most recent logs
        const energyCounts = { low: 0, medium: 0, high: 0, unchanged: 0 };
        recentLogs.forEach(log => {
          if (log.energyLevel) {
            energyCounts[log.energyLevel]++;
          }
        });

        setMacroPieChartData([
          { name: "Low Energy", value: energyCounts.low, fillKey: "chart-5" },
          { name: "Medium Energy", value: energyCounts.medium, fillKey: "chart-2" },
          { name: "High Energy", value: energyCounts.high, fillKey: "chart-1" },
          { name: "Unchanged Energy", value: energyCounts.unchanged, fillKey: "chart-3" },
        ].filter(d => d.value > 0)); // Only show categories with data for pie chart
      } else {
        setCalorieChartData(defaultCalorieData); // Reset to default if no logs
        setMacroPieChartData(defaultMacroData.map(d => ({...d, value: 0}))); // Reset pie chart values to 0
      }
    }
  }, [mounted, userId]);


  if (!mounted) {
    return (
      <div className="space-y-4">
        <div className="h-64 bg-muted rounded-md animate-pulse flex items-center justify-center">
          <BarChart className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="h-64 bg-muted rounded-md animate-pulse flex items-center justify-center">
          <PieChart className="h-12 w-12 text-muted-foreground" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><TrendingUp className="h-5 w-5 mr-2 text-primary" />Meal Log Frequency (Last 7 Days)</CardTitle>
          <CardDescription>Number of meals logged each day.</CardDescription>
        </CardHeader>
        <CardContent>
          {!hasLogData && (
             <Alert variant="default" className="bg-primary/10 border-primary/30">
                <Info className="h-4 w-4 text-primary" />
                <AlertDescription className="text-primary/90">
                  No meal logs found for the last 7 days. Start logging your meals to see your progress here!
                </AlertDescription>
            </Alert>
          )}
          {hasLogData && (
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={calorieChartData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
                  <RechartsTooltip 
                    content={<ChartTooltipContent />} 
                    cursor={{ fill: 'hsl(var(--muted))', radius: 4 }}
                  />
                  <RechartsLegend content={<ChartLegendContent />} />
                  {/* <RechartsBar dataKey="planned" fill="var(--color-planned)" radius={4} /> */}
                  <RechartsBar dataKey="actual" fill="var(--color-actual)" radius={4} name="Logged Meals" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><PieChart className="h-5 w-5 mr-2 text-primary" />Post-Meal Energy Levels (Recent Logs)</CardTitle>
          <CardDescription>Distribution of energy levels from your recent meal logs.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          {!hasLogData && (
             <Alert variant="default" className="bg-primary/10 border-primary/30">
                <Info className="h-4 w-4 text-primary" />
                <AlertDescription className="text-primary/90">
                  No energy level data from recent meal logs. Log your meals and energy to see this chart.
                </AlertDescription>
            </Alert>
          )}
          {hasLogData && macroPieChartData.length > 0 && (
            <ChartContainer config={chartConfig} className="h-64 w-full max-w-xs">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <RechartsTooltip 
                    content={<ChartTooltipContent hideLabel nameKey="name" />}
                  />
                  <Pie data={macroPieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {macroPieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(var(--${entry.fillKey}))`} />
                    ))}
                  </Pie>
                  <RechartsLegend 
                      content={<ChartLegendContent nameKey="name" />} 
                      payload={macroPieChartData.map(entry => ({ value: entry.name, type: 'square', color: `hsl(var(--${entry.fillKey}))` }))}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
           {hasLogData && macroPieChartData.length === 0 && (
             <Alert variant="default" className="bg-primary/10 border-primary/30">
                <Info className="h-4 w-4 text-primary" />
                <AlertDescription className="text-primary/90">
                  Not enough energy level data in recent logs to display this chart.
                </AlertDescription>
            </Alert>
           )}
        </CardContent>
      </Card>
      <p className="text-center text-sm text-muted-foreground">More detailed charts and adherence tracking coming soon!</p>
    </div>
  );
}
