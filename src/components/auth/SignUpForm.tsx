"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, type SignUpFormData, healthGoals, commonDietaryRestrictions } from "@/lib/schemas/authSchemas";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription, // Added FormDescription
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

interface SignUpFormProps {
  onSubmit: (data: SignUpFormData) => void; // This will be mutation.mutate
  isPending: boolean;
}

export function SignUpForm({ onSubmit, isPending }: SignUpFormProps) {
  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
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
      primaryHealthGoal: undefined, 
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
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
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} disabled={isPending} />
              </FormControl>
              <FormDescription>
                Min 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} disabled={isPending} />
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
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={isPending}>
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
          <FormLabel>Dietary Restrictions (Optional)</FormLabel>
          <FormDescription className="pb-2">Select any that apply to you.</FormDescription>
          <ScrollArea className={cn("h-40 rounded-md border p-4", isPending && "opacity-50 pointer-events-none")}>
            <fieldset disabled={isPending} className="space-y-3">
              {Object.entries(commonDietaryRestrictions).map(([key, label]) => (
                <FormField
                  key={key}
                  control={form.control}
                  name={`dietaryRestrictions.${key as keyof SignUpFormData['dietaryRestrictions']}`}
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

        <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Account
        </Button>
      </form>
    </Form>
  );
}
