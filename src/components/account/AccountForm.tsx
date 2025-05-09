
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { accountSettingsSchema, type AccountSettingsFormData, healthGoals, commonDietaryRestrictions, cookingTimePreferences } from "@/lib/schemas/authSchemas";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface AccountFormProps {
  onSubmit: (data: AccountSettingsFormData) => void;
  initialData?: AccountSettingsFormData;
  isPending: boolean;
}

export function AccountForm({ onSubmit, initialData, isPending }: AccountFormProps) {
  const form = useForm<AccountSettingsFormData>({
    resolver: zodResolver(accountSettingsSchema),
    defaultValues: initialData || {
      username: "",
      email: "",
      primaryHealthGoal: undefined,
      dietaryRestrictions: {
        glutenFree: false,
        dairyFree: false,
        vegetarian: false,
        vegan: false,
        nutAllergy: false,
        shellfishAllergy: false,
        soyAllergy: false,
        lowCarb: false,
        keto: false,
        paleo: false,
        lowFodmap: false,
        other: "",
      },
      foodPreferences: "",
      cookingTimePreference: undefined,
      lifestyleInfo: "",
    },
  });

  React.useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="youruniqueusername" {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="primaryHealthGoal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary Health Goal</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your primary health goal" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {healthGoals.map((goal) => (
                    <SelectItem key={goal} value={goal}>
                      {goal}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormItem>
          <FormLabel>Dietary Restrictions</FormLabel>
          <FormDescription className="pb-2">Select any that apply to you.</FormDescription>
          <ScrollArea className={cn("h-48 rounded-md border p-4", isPending && "opacity-50 pointer-events-none")}>
             <fieldset disabled={isPending} className="space-y-3">
              {Object.entries(commonDietaryRestrictions).map(([key, label]) => (
                <FormField
                  key={key}
                  control={form.control}
                  name={`dietaryRestrictions.${key as keyof NonNullable<AccountSettingsFormData['dietaryRestrictions']>}`}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value as boolean | undefined}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">{label}</FormLabel>
                    </FormItem>
                  )}
                />
              ))}
              <FormField
                control={form.control}
                name="dietaryRestrictions.other"
                render={({ field }) => (
                  <FormItem className="pt-2">
                    <FormLabel className="font-normal">Other Restrictions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List any other restrictions, comma-separated"
                        {...field}
                        value={field.value ?? ""}
                        rows={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </fieldset>
          </ScrollArea>
        </FormItem>

        <FormField
          control={form.control}
          name="foodPreferences"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Food Preferences</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Favorite cuisines, liked/disliked foods" {...field} disabled={isPending} rows={3}/>
              </FormControl>
              <FormDescription>Helps us suggest meals you'll love!</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
            control={form.control}
            name="cookingTimePreference"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Cooking Time Preference</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                <FormControl>
                    <SelectTrigger>
                    <SelectValue placeholder="Select preferred cooking time" />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                    {cookingTimePreferences.map((time) => (
                    <SelectItem key={time} value={time}>
                        {time}
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
            )}
        />

        <FormField
          control={form.control}
          name="lifestyleInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lifestyle Information</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Busy professional, student, athlete" {...field} disabled={isPending} rows={3}/>
              </FormControl>
              <FormDescription>Helps us tailor suggestions to your daily routine.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />


        <Button type="submit" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </form>
    </Form>
  );
}
