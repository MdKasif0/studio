
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { accountSettingsSchema, type AccountSettingsFormData, healthGoals, commonDietaryRestrictions } from "@/lib/schemas/authSchemas";
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

interface AccountFormProps {
  onSubmit: (data: AccountSettingsFormData) => Promise<void>;
  initialData: AccountSettingsFormData;
}

export function AccountForm({ onSubmit, initialData }: AccountFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const form = useForm<AccountSettingsFormData>({
    resolver: zodResolver(accountSettingsSchema),
    defaultValues: initialData || {
      username: "",
      email: "",
      primaryHealthGoal: undefined,
      dietaryRestrictions: {
        other: "",
      },
    },
  });

  React.useEffect(() => {
    form.reset(initialData);
  }, [initialData, form]);

  const handleSubmit = async (data: AccountSettingsFormData) => {
    setIsSubmitting(true);
    await onSubmit(data);
    setIsSubmitting(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="youruniqueusername" {...field} />
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
                <Input type="email" placeholder="you@example.com" {...field} />
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
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
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
          <ScrollArea className="h-48 rounded-md border p-4">
            <div className="space-y-3">
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
            </div>
          </ScrollArea>
        </FormItem>

        <Button type="submit" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </form>
    </Form>
  );
}
