
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, PieChart, TrendingUp } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Pie, Cell, Bar as RechartsBar, ResponsiveContainer, BarChart as RechartsBarChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend as RechartsLegend, PieChart as RechartsPieChart } from "recharts";
import React from "react";


// Placeholder data
const calorieData = [
  { date: "Mon", planned: 2000, actual: 1950 },
  { date: "Tue", planned: 2000, actual: 2100 },
  { date: "Wed", planned: 1800, actual: 1850 },
  { date: "Thu", planned: 2000, actual: 1900 },
  { date: "Fri", planned: 2200, actual: 2150 },
  { date: "Sat", planned: 2200, actual: 2300 },
  { date: "Sun", planned: 2000, actual: 2050 },
];

const macroData = [
  { name: "Protein", value: 30, fillKey: "chart-1" },
  { name: "Carbs", value: 45, fillKey: "chart-2" },
  { name: "Fats", value: 25, fillKey: "chart-4" },
];

const chartConfig = {
  planned: { label: "Planned Calories", color: "hsl(var(--chart-5))" },
  actual: { label: "Actual Calories", color: "hsl(var(--chart-1))" },
  "chart-1": { label: "Protein", color: "hsl(var(--chart-1))" }, // For Pie chart
  "chart-2": { label: "Carbs", color: "hsl(var(--chart-2))" },   // For Pie chart
  "chart-4": { label: "Fats", color: "hsl(var(--chart-4))" },    // For Pie chart
} satisfies import("@/components/ui/chart").ChartConfig;


export function ProgressCharts() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

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
          <CardTitle className="flex items-center"><TrendingUp className="h-5 w-5 mr-2 text-primary" />Calorie Intake (Last 7 Days)</CardTitle>
          <CardDescription>Planned vs. Actual calorie consumption. (Sample Data)</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={calorieData}>
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
          <CardTitle className="flex items-center"><PieChart className="h-5 w-5 mr-2 text-primary" />Average Macronutrient Distribution</CardTitle>
          <CardDescription>Typical breakdown of your macronutrients. (Sample Data)</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ChartContainer config={chartConfig} className="h-64 w-full max-w-xs">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <RechartsTooltip 
                  content={<ChartTooltipContent hideLabel nameKey="name" />}
                />
                <Pie data={macroData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {macroData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(var(--${entry.fillKey}))`} />
                  ))}
                </Pie>
                <RechartsLegend 
                    content={<ChartLegendContent nameKey="name" />} 
                    payload={macroData.map(entry => ({ value: entry.name, type: 'square', color: `hsl(var(--${entry.fillKey}))` }))}
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

// Removed RechartsPrimitive as direct import from 'recharts' is now used for PieChart.
