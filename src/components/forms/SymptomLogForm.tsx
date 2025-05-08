"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { symptomLogSchema, type SymptomLogFormValues } from "@/lib/schemas/appSchemas";

interface SymptomLogFormProps {
  onSubmit: (data: SymptomLogFormValues) => void; // This will be mutation.mutate
  isPending: boolean;
  initialDateTime?: string; // To allow parent to set initial time if needed
}

export function SymptomLogForm({ onSubmit, isPending, initialDateTime }: SymptomLogFormProps) {
  const [isClient, setIsClient] = useState(false);
  const [currentDefaultLogTime, setCurrentDefaultLogTime] = useState<string>("");

  useEffect(() => {
    setIsClient(true);
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - (offset * 60 * 1000));
    setCurrentDefaultLogTime(localDate.toISOString().slice(0, 16));
  }, []);

  const form = useForm<SymptomLogFormValues>({
    resolver: zodResolver(symptomLogSchema),
    defaultValues: {
      mealName: "",
      logTime: "", // Will be set by useEffect
      energyLevel: "unchanged",
      mood: "",
      digestiveSymptoms: "",
      otherSymptoms: "",
      notes: "",
    },
  });

 useEffect(() => {
    if (isClient) {
      const timeToSet = initialDateTime || currentDefaultLogTime;
      if (timeToSet && !form.getValues("logTime")) {
         form.reset({ 
            ...form.formState.defaultValues, // Keep other defaults
            mealName: form.getValues("mealName") || "", // Preserve any typed meal name
            energyLevel: form.getValues("energyLevel") || "unchanged",
            mood: form.getValues("mood") || "",
            digestiveSymptoms: form.getValues("digestiveSymptoms") || "",
            otherSymptoms: form.getValues("otherSymptoms") || "",
            notes: form.getValues("notes") || "",
            logTime: timeToSet 
        });
      }
    }
  }, [isClient, initialDateTime, currentDefaultLogTime, form]);


  if (!isClient) {
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

  if (isClient && !form.getValues("logTime") && !initialDateTime && !currentDefaultLogTime) {
     return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Initializing form...</span>
      </div>
    );
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
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
              <Select onValueChange={field.onChange} value={field.value || "unchanged"}>
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
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
          {isPending ? (
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