
"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { healthGoals, commonDietaryRestrictions, type AccountSettingsFormData } from '@/lib/schemas/authSchemas';
import { useMutation } from '@tanstack/react-query';
import { handleAccountUpdate } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { AuthUser, StoredUserDetails } from '@/lib/authLocalStorage';
import { saveUserDetails, getUserDetails } from '@/lib/authLocalStorage';
import { Loader2 } from 'lucide-react';

const onboardingSchema = z.object({
  primaryHealthGoal: z.enum(healthGoals, {
    errorMap: () => ({ message: 'Please select a primary health goal.' }),
  }),
  dietaryRestrictions: z.object(
    Object.fromEntries(
      Object.keys(commonDietaryRestrictions).map(key => [key, z.boolean().default(false).optional()])
    ) as Record<keyof typeof commonDietaryRestrictions, z.ZodOptional<z.ZodBoolean>> & { other: z.ZodOptional<z.ZodString> }
  ).extend({ other: z.string().optional() }).optional(),
  // Add more steps/fields as needed
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

interface OnboardingDialogProps {
  user: AuthUser;
  onComplete: () => void;
}

const TOTAL_STEPS = 2; // Example: Goal setting, Dietary restrictions

export function OnboardingDialog({ user, onComplete }: OnboardingDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();

  const existingUserDetails = getUserDetails(user.id);

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      primaryHealthGoal: existingUserDetails?.primaryHealthGoal || healthGoals[0],
      dietaryRestrictions: existingUserDetails?.dietaryRestrictions || {
        glutenFree: false, dairyFree: false, vegetarian: false, vegan: false,
        nutAllergy: false, shellfishAllergy: false, soyAllergy: false,
        lowCarb: false, keto: false, paleo: false, lowFodmap: false, other: "",
      },
    },
  });

  const accountUpdateMutation = useMutation({
    mutationFn: async (data: OnboardingFormData) => {
      const accountData: AccountSettingsFormData = {
        username: user.username, // Username and email are not changed in onboarding
        email: user.email,
        primaryHealthGoal: data.primaryHealthGoal,
        dietaryRestrictions: data.dietaryRestrictions,
      };
      // We are not calling the server action here, just saving to local storage
      // as the server action `handleAccountUpdate` is more for profile editing
      // For onboarding, direct local storage update is fine for now.
      const newDetails: StoredUserDetails = {
          primaryHealthGoal: data.primaryHealthGoal,
          dietaryRestrictions: data.dietaryRestrictions || {},
          profilePictureDataUrl: existingUserDetails?.profilePictureDataUrl, 
        };
      saveUserDetails(user.id, newDetails);
      return { success: true, message: "Onboarding data saved." };
    },
    onSuccess: (response) => {
      if (response.success) {
        toast({ title: 'Welcome!', description: 'Your initial preferences have been saved.' });
        onComplete();
      } else {
        toast({ variant: "destructive", title: 'Error', description: response.message });
      }
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: 'Onboarding Error', description: error.message });
    },
  });


  const handleNextStep = () => {
    form.trigger().then(isValid => {
      if (isValid) {
        if (currentStep < TOTAL_STEPS) {
          setCurrentStep(prev => prev + 1);
        } else {
          // Last step, submit the form
          accountUpdateMutation.mutate(form.getValues());
        }
      } else {
        // Highlight errors
        Object.keys(form.formState.errors).forEach(key => {
          const fieldKey = key as keyof OnboardingFormData;
          toast({
            variant: "destructive",
            title: `Error in ${fieldKey}`,
            description: form.formState.errors[fieldKey]?.message
          })
        })
      }
    });
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const progressValue = (currentStep / TOTAL_STEPS) * 100;

  return (
    <Dialog open={true} onOpenChange={(isOpen) => { if (!isOpen) onComplete(); }}>
      <DialogContent className="sm:max-w-md md:max-w-lg" onPointerDownOutside={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome to Nutri AI, {user.username}!</DialogTitle>
          <DialogDescription>Let&apos;s set up your preferences to personalize your experience.</DialogDescription>
        </DialogHeader>

        <Progress value={progressValue} className="w-full my-4" />
        <p className="text-sm text-muted-foreground text-center mb-4">Step {currentStep} of {TOTAL_STEPS}</p>

        <Form {...form}>
          <form onSubmit={(e) => {e.preventDefault(); handleNextStep();}} className="space-y-6">
            {currentStep === 1 && (
              <FormField
                control={form.control}
                name="primaryHealthGoal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">What&apos;s your primary health goal?</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={accountUpdateMutation.isPending}>
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
                    <FormDescription>This helps us tailor suggestions for you.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {currentStep === 2 && (
              <FormItem>
                <FormLabel className="text-lg">Any dietary restrictions or strong preferences?</FormLabel>
                <FormDescription className="pb-2">Select any that apply. This is optional.</FormDescription>
                <ScrollArea className="h-60 rounded-md border p-4">
                  <fieldset disabled={accountUpdateMutation.isPending} className="space-y-3">
                    {Object.entries(commonDietaryRestrictions).map(([key, label]) => (
                      <FormField
                        key={key}
                        control={form.control}
                        name={`dietaryRestrictions.${key as keyof NonNullable<OnboardingFormData['dietaryRestrictions']>}`}
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
                          <FormLabel className="font-normal">Other Restrictions/Preferences</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="e.g., Low sodium, prefer vegetarian on weekdays"
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
            )}
            {/* Add more steps here */}

            <DialogFooter className="sm:justify-between pt-4">
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={handlePreviousStep} disabled={accountUpdateMutation.isPending}>
                  Previous
                </Button>
              )}
               <div className="sm:flex-grow sm:text-right"> {/* This div ensures the next/finish button is pushed to the right if previous is not there */}
                <Button type="submit" disabled={accountUpdateMutation.isPending} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  {accountUpdateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {currentStep === TOTAL_STEPS ? 'Finish Setup' : 'Next'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
