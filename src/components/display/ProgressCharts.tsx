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
import { Bar, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend as RechartsLegend, ResponsiveContainer, Pie, Cell, Bar as RechartsBar } from "recharts"; // ShadCN chart uses recharts
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
  { name: "Protein", value: 30, fill: "hsl(var(--chart-1))" }, // Green
  { name: "Carbs", value: 45, fill: "hsl(var(--chart-2))" },   // Orange
  { name: "Fats", value: 25, fill: "hsl(var(--chart-4))" },    // Medium Green
];

const chartConfig = {
  planned: { label: "Planned Calories", color: "hsl(var(--chart-5))" }, // Darker Orange
  actual: { label: "Actual Calories", color: "hsl(var(--chart-1))" },   // Light Green
  protein: { label: "Protein", color: "hsl(var(--chart-1))" },
  carbs: { label: "Carbs", color: "hsl(var(--chart-2))" },
  fats: { label: "Fats", color: "hsl(var(--chart-4))" },
} satisfies import("@/components/ui/chart").ChartConfig;


export function ProgressCharts() {
  // useEffect to avoid hydration errors with client-side charts
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
              <RechartsPrimitive.PieChart>
                <RechartsTooltip content={<ChartTooltipContent hideLabel nameKey="name"/>} />
                <Pie data={macroData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {macroData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <RechartsLegend content={<ChartLegendContent nameKey="name" />} />
              </RechartsPrimitive.PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      <p className="text-center text-sm text-muted-foreground">More detailed charts and adherence tracking coming soon!</p>
    </div>
  );
}

// Recharts Primitive needed for Pie chart to work with ShadCN Chart components
const RechartsPrimitive = { PieChart: ({children, ...props}: any) => <div {...props}>{children}</div> };
RechartsPrimitive.PieChart = Recharts.PieChart;
