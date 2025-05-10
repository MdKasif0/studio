
"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription as ShadDialogDescription } from '@/components/ui/dialog'; // Renamed DialogDescription
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter as AlertDFooter, AlertDialogHeader as AlertDHeader, AlertDialogTitle as AlertDTitle } from '@/components/ui/alert-dialog'; // Renamed to avoid conflict
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription as ShadFormDescription } from '@/components/ui/form'; // Renamed FormDescription
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { healthGoals, commonDietaryRestrictions, type AccountSettingsFormData } from '@/lib/schemas/authSchemas';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { AuthUser, StoredUserDetails } from '@/lib/authLocalStorage';
import { saveUserDetails, getUserDetails, hasAcknowledgedMedicalDisclaimer, acknowledgeMedicalDisclaimer } from '@/lib/authLocalStorage';
import { Loader2, Leaf, Utensils, MessageSquareHeart, BarChart3, ClipboardList, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

const onboardingSchema = z.object({
  primaryHealthGoal: z.enum(healthGoals, {
    errorMap: () => ({ message: 'Please select a primary health goal.' }),
  }),
  dietaryRestrictions: z.object(
    Object.fromEntries(
      Object.keys(commonDietaryRestrictions).map(key => [key, z.boolean().default(false).optional()])
    ) as Record<keyof typeof commonDietaryRestrictions, z.ZodOptional<z.ZodBoolean>> & { other: z.ZodOptional<z.ZodString> }
  ).extend({ other: z.string().optional() }).optional(),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

interface OnboardingDialogProps {
  user: AuthUser;
  onComplete: () => void;
}

const TOTAL_STEPS = 3; 

export function OnboardingDialog({ user, onComplete }: OnboardingDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();
  const existingUserDetails = getUserDetails(user.id);
  const [showRestrictionsDisclaimer, setShowRestrictionsDisclaimer] = useState(false);

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

  const saveOnboardingMutation = useMutation({
    mutationFn: async (data: OnboardingFormData) => {
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

  const proceedToNextStepOrFinish = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    } else {
      saveOnboardingMutation.mutate(form.getValues());
    }
  };

  const handleNextStep = async () => {
    let isValid = true;
    if (currentStep === 1) {
      isValid = await form.trigger("primaryHealthGoal");
    } else if (currentStep === 2) {
      isValid = await form.trigger("dietaryRestrictions");
    }

    if (isValid) {
      if (currentStep === 2 && !hasAcknowledgedMedicalDisclaimer(user.id, 'restrictions')) {
        setShowRestrictionsDisclaimer(true);
        return; // Wait for disclaimer acknowledgement
      }
      proceedToNextStepOrFinish();
    } else {
        const errors = form.formState.errors;
        if (errors.primaryHealthGoal) {
             toast({ variant: "destructive", title: "Goal Needed", description: errors.primaryHealthGoal.message });
        } else if (errors.dietaryRestrictions) {
            toast({ variant: "destructive", title: "Check Restrictions", description: "Please review dietary restrictions." });
        }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const progressValue = (currentStep / TOTAL_STEPS) * 100;

  return (
    <>
      <Dialog open={true} onOpenChange={(isOpen) => { if (!isOpen && !showRestrictionsDisclaimer) onComplete(); }}>
        <DialogContent className="sm:max-w-md md:max-w-lg" onPointerDownOutside={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-2xl">Welcome to Nutri AI, {user.username}!</DialogTitle>
            <ShadDialogDescription>Let&apos;s quickly set up your preferences to personalize your experience.</ShadDialogDescription>
          </DialogHeader>

          <Progress value={progressValue} className="w-full my-4" />
          <p className="text-sm text-muted-foreground text-center mb-4">Step {currentStep} of {TOTAL_STEPS}</p>

          <Form {...form}>
            <form onSubmit={(e) => {e.preventDefault(); handleNextStep();}} className="space-y-6 min-h-[250px]">
              {currentStep === 1 && (
                <FormField
                  control={form.control}
                  name="primaryHealthGoal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">What&apos;s your primary health goal?</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={saveOnboardingMutation.isPending}>
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
                      <ShadFormDescription>This helps us tailor suggestions for you.</ShadFormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {currentStep === 2 && (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">Any dietary restrictions or strong preferences?</FormLabel>
                  <ShadFormDescription className="pb-2">Select any that apply. This is optional.</ShadFormDescription>
                  <ScrollArea className="h-60 rounded-md border p-4">
                    <fieldset disabled={saveOnboardingMutation.isPending} className="space-y-3">
                      {Object.entries(commonDietaryRestrictions).map(([key, label]) => (
                        <FormField
                          key={key}
                          control={form.control}
                          name={`dietaryRestrictions.${key as keyof NonNullable<OnboardingFormData['dietaryRestrictions']>}`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={!!field.value} 
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
              
              {currentStep === 3 && (
                  <div className="space-y-3">
                      <h3 className="text-lg font-semibold">Quick Tour: Key Features!</h3>
                      <p className="text-sm text-muted-foreground">
                          Nutri AI is packed with features to help you on your wellness journey. Here are a few highlights:
                      </p>
                      <ul className="list-none space-y-2 text-sm">
                          <li className="flex items-center gap-2"><Utensils className="h-5 w-5 text-primary"/> Personalized Meal Plans tailored to your goals.</li>
                          <li className="flex items-center gap-2"><ClipboardList className="h-5 w-5 text-primary"/> In-depth Dietary Analysis for insights.</li>
                          <li className="flex items-center gap-2"><MessageSquareHeart className="h-5 w-5 text-primary"/> AI Assistant for questions and motivation.</li>
                          <li className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary"/> Progress Tracking to see how far you&apos;ve come.</li>
                      </ul>
                      <p className="text-sm text-muted-foreground pt-2">
                          Explore these sections from the navigation menu. You can always update your preferences in the <Link href="/account" className="text-primary hover:underline" onClick={onComplete}>Account</Link> section.
                      </p>
                  </div>
              )}

              <DialogFooter className="sm:justify-between pt-4 absolute bottom-6 right-6 left-6">
                {currentStep > 1 && (
                  <Button type="button" variant="outline" onClick={handlePreviousStep} disabled={saveOnboardingMutation.isPending}>
                    Previous
                  </Button>
                )}
                 <div className={`sm:flex-grow ${currentStep === 1 ? 'sm:text-right' : ''}`}>
                  <Button type="submit" disabled={saveOnboardingMutation.isPending} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    {saveOnboardingMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {currentStep === TOTAL_STEPS ? 'Start My Journey!' : 'Next'}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {showRestrictionsDisclaimer && (
        <AlertDialog open={showRestrictionsDisclaimer} onOpenChange={(open) => { if (!open) setShowRestrictionsDisclaimer(false); }}>
          <AlertDialogContent>
            <AlertDHeader>
              <AlertDTitle className="flex items-center"><ShieldAlert className="h-5 w-5 mr-2 text-destructive" /> Important Disclaimer</AlertDTitle>
              <AlertDialogDescription>
                Information regarding dietary restrictions is used for personalization. Nutri AI is not a medical tool. Always consult a healthcare provider for health concerns or before making health-related decisions.
              </AlertDialogDescription>
            </AlertDHeader>
            <AlertDFooter>
              <AlertDialogAction onClick={() => {
                acknowledgeMedicalDisclaimer(user.id, 'restrictions');
                setShowRestrictionsDisclaimer(false);
                proceedToNextStepOrFinish(); // Proceed after acknowledgement
              }} className="bg-primary hover:bg-primary/90">I Understand</AlertDialogAction>
            </AlertDFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
