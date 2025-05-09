
"use client";

import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema, type OnboardingFormData, healthGoals, commonDietaryRestrictions, cookingTimePreferences } from "@/lib/schemas/authSchemas";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Smile, Utensils, Target, Leaf, ChefHat, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { getAuthUser, saveUserDetails, setOnboardingComplete, StoredUserDetails, getUserDetails } from "@/lib/authLocalStorage";
import { cn } from "@/lib/utils";

const steps = [
  { id: "welcome", title: "Welcome", icon: Smile },
  { id: "healthGoal", title: "Health Goal", icon: Target },
  { id: "dietaryRestrictions", title: "Dietary Needs", icon: Leaf },
  { id: "preferences", title: "Food & Lifestyle", icon: Utensils },
  { id: "finish", title: "All Set!", icon: ChefHat },
];

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const authUser = getAuthUser();

  const methods = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: async () => {
        if (authUser) {
            const existingDetails = getUserDetails(authUser.id);
            return {
                primaryHealthGoal: existingDetails?.primaryHealthGoal || undefined,
                dietaryRestrictions: existingDetails?.dietaryRestrictions || { other: "" },
                foodPreferences: existingDetails?.foodPreferences || "",
                cookingTimePreference: existingDetails?.cookingTimePreference || undefined,
                lifestyleInfo: existingDetails?.lifestyleInfo || "",
            };
        }
        return {
            primaryHealthGoal: undefined,
            dietaryRestrictions: { other: ""},
            foodPreferences: "",
            cookingTimePreference: undefined,
            lifestyleInfo: "",
        };
    },
  });


  const { handleSubmit, trigger, formState: { errors } } = methods;

  const handleNext = async () => {
    let isValid = true;
    if (steps[currentStep].id === "healthGoal") {
      isValid = await trigger("primaryHealthGoal");
    } else if (steps[currentStep].id === "preferences") {
      isValid = await trigger(["foodPreferences", "cookingTimePreference", "lifestyleInfo"]);
    }
    // No specific validation needed for welcome, dietaryRestrictions (optional parts), or finish step before submit
    
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (isValid && currentStep === steps.length - 1) {
        // This case should ideally be handled by the main onSubmit, but included for clarity
        await onSubmit(methods.getValues());
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: OnboardingFormData) => {
    if (!authUser) {
      toast({ variant: "destructive", title: "Error", description: "User not authenticated." });
      return;
    }
    setIsLoading(true);
    try {
      const userDetailsToSave: StoredUserDetails = {
        primaryHealthGoal: data.primaryHealthGoal,
        dietaryRestrictions: data.dietaryRestrictions,
        foodPreferences: data.foodPreferences,
        cookingTimePreference: data.cookingTimePreference,
        lifestyleInfo: data.lifestyleInfo,
        // profilePictureDataUrl will be handled in account settings for now
      };
      saveUserDetails(authUser.id, userDetailsToSave);
      setOnboardingComplete(authUser.id, true);

      toast({
        title: "Profile Setup Complete!",
        description: "Welcome aboard! You're all set to explore Nutri AI.",
      });
      // Placeholder for interactive tutorial trigger
      setTimeout(() => {
         toast({
            title: "Quick Tip!",
            description: "A guided tour of Nutri AI's features will be available soon to help you get started.",
            duration: 5000,
        });
        router.replace("/");
      }, 1000);


    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not save your preferences." });
    } finally {
      setIsLoading(false);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const CurrentIcon = steps[currentStep].icon;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-lg font-medium text-foreground">
                <CurrentIcon className="h-6 w-6 text-primary" />
                <span>{steps[currentStep].title}</span>
            </div>
            <span className="text-sm text-muted-foreground">Step {currentStep + 1} of {steps.length}</span>
        </div>
        <Progress value={progress} className="w-full mb-6 h-2" />

        {currentStep === 0 && ( // Welcome
          <div className="text-center space-y-4 py-8">
            <Zap className="mx-auto h-12 w-12 text-accent animate-pulse" />
            <h2 className="text-2xl font-semibold">Let's Get Started!</h2>
            <p className="text-muted-foreground">
              We'll ask a few questions to tailor Nutri AI to your unique needs.
              This will only take a couple of minutes.
            </p>
          </div>
        )}

        {currentStep === 1 && ( // Health Goal
          <FormField
            control={methods.control}
            name="primaryHealthGoal"
            render={({ field }) => (
              <FormItem className="animate-in fade-in duration-500">
                <FormLabel className="text-lg">What's your primary health goal?</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your goal" />
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
        )}

        {currentStep === 2 && ( // Dietary Restrictions
            <div className="animate-in fade-in duration-500">
              <FormLabel className="text-lg block mb-2">Any dietary restrictions or allergies?</FormLabel>
              <FormDescription className="mb-4">Select all that apply. You can specify others too.</FormDescription>
              <ScrollArea className={cn("h-60 rounded-md border p-4")}>
                <div className="space-y-3">
                  {Object.entries(commonDietaryRestrictions).map(([key, label]) => (
                    <FormField
                      key={key}
                      control={methods.control}
                      name={`dietaryRestrictions.${key as keyof OnboardingFormData['dietaryRestrictions']}`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
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
                    control={methods.control}
                    name="dietaryRestrictions.other"
                    render={({ field }) => (
                      <FormItem className="pt-2">
                        <FormLabel className="font-normal">Other (please specify)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Low-sodium, specific fruit allergy"
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
            </div>
        )}

        {currentStep === 3 && ( // Preferences
          <div className="space-y-6 animate-in fade-in duration-500">
            <FormField
              control={methods.control}
              name="foodPreferences"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">What kind of foods do you enjoy?</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Favorite cuisines (Italian, Mexican), specific likes/dislikes (love spicy, hate cilantro)" {...field} rows={3} />
                  </FormControl>
                  <FormDescription>This helps us suggest meals you'll love!</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={methods.control}
              name="cookingTimePreference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">How much time do you typically like to spend cooking?</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cooking time" />
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
              control={methods.control}
              name="lifestyleInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Tell us a bit about your lifestyle (optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Busy professional, student on a budget, active athlete, parent of young kids" {...field} rows={3} />
                  </FormControl>
                   <FormDescription>Helps us tailor suggestions to your daily routine.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {currentStep === 4 && ( // Finish
          <div className="text-center space-y-4 py-8 animate-in fade-in duration-500">
             <ChefHat className="mx-auto h-12 w-12 text-accent" />
            <h2 className="text-2xl font-semibold">You're All Set!</h2>
            <p className="text-muted-foreground">
              Thanks for sharing your preferences. Click "Finish Setup" to start your personalized Nutri AI experience.
            </p>
          </div>
        )}

        <div className="flex justify-between pt-8">
          <Button type="button" variant="outline" onClick={handlePrevious} disabled={currentStep === 0 || isLoading}>
            Previous
          </Button>
          {currentStep < steps.length - 1 ? (
            <Button type="button" onClick={handleNext} disabled={isLoading} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Next
            </Button>
          ) : (
            <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Finish Setup
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
