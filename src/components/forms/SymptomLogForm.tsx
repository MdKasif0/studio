
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const symptomLogSchema = z.object({
  mealName: z.string().min(1, "Please enter the meal name or description."),
  logTime: z.string().min(1, "Please select the time of logging."),
  energyLevel: z.enum(["low", "medium", "high", "unchanged"]).optional(),
  mood: z.string().optional(),
  digestiveSymptoms: z.string().optional(),
  otherSymptoms: z.string().optional(),
  notes: z.string().optional(),
});

type SymptomLogFormValues = z.infer<typeof symptomLogSchema>;

export function SymptomLogForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [defaultLogTime, setDefaultLogTime] = useState("");

  useEffect(() => {
    setIsClient(true);
    // Set default log time on client mount to avoid hydration issues with datetime-local
    const now = new Date();
    // Adjust for local timezone
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - (offset*60*1000));
    setDefaultLogTime(localDate.toISOString().slice(0,16));
  }, []);


  const form = useForm<SymptomLogFormValues>({
    resolver: zodResolver(symptomLogSchema),
    defaultValues: {
      mealName: "",
      logTime: "", 
      energyLevel: "unchanged",
      mood: "",
      digestiveSymptoms: "",
      otherSymptoms: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (isClient && defaultLogTime && !form.getValues("logTime")) {
      form.reset({ ...form.getValues(), logTime: defaultLogTime });
    }
  }, [isClient, defaultLogTime, form]);


  const handleSubmit = async (values: SymptomLogFormValues) => {
    setIsSubmitting(true);
    console.log("Symptom Log Submitted:", values);
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    toast({
      title: "Symptom Logged (Simulation)",
      description: "Your feelings have been recorded. This data will help refine future suggestions (feature in development).",
    });
    form.reset({
      mealName: "",
      logTime: defaultLogTime, 
      energyLevel: "unchanged",
      mood: "",
      digestiveSymptoms: "",
      otherSymptoms: "",
      notes: "",
    });
    setIsSubmitting(false);
  };

  if (!isClient) {
    // Render a basic skeleton on SSR to avoid hydration mismatch with datetime-local
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-1/3" />
        </div>
    );
  }

  // If client-side, but defaultLogTime is not ready (should be very quick)
  if (!defaultLogTime) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Initializing form...</span>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 md:space-y-6">
        <FormField
          control={form.control}
          name="mealName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meal Consumed</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Lunch - Salad with Chicken" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
            control={form.control}
            name="logTime"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Time of Logging</FormLabel>
                <FormControl>
                    <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
        <FormField
          control={form.control}
          name="energyLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Energy Level Post-Meal</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select energy level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="unchanged">Unchanged</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="digestiveSymptoms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Digestive Feelings (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Bloated, comfortable, gassy, none" {...field} />
              </FormControl>
              <FormDescription className="text-xs">Note any digestive comfort or discomfort.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mood"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Overall Mood (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Happy, tired, irritable, focused" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="otherSymptoms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Other Symptoms or Feelings (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Headache, skin reaction, brain fog..." rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Any other details you want to record." rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging...
            </>
          ) : (
            "Log Symptoms"
          )}
        </Button>
      </form>
    </Form>
  );
}

