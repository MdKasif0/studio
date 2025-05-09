
"use client"; 

import React from 'react';
import { useMutation } from "@tanstack/react-query";
import { AuthTabs } from "@/components/auth/AuthTabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Leaf, Terminal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { handleLogin, handleSignUp } from "@/lib/actions";
import type { LoginFormData, SignUpFormData } from "@/lib/schemas/authSchemas";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import { saveAuthUser, type AuthUser, saveUserDetails, setOnboardingComplete, getOnboardingComplete } from '@/lib/authLocalStorage';


export default function SignInPage() {
  const { toast } = useToast();
  const router = useRouter();

  // Mutation for Login
  const loginMutation = useMutation({
    mutationFn: handleLogin,
    onSuccess: (data) => {
      if (data.success && data.user) {
        saveAuthUser(data.user as AuthUser);
        toast({
          title: "Login Successful!",
          description: data.message,
        });
        // Check onboarding status after login
        if (!getOnboardingComplete(data.user.id)) {
          router.push('/onboarding');
        } else {
          router.push('/'); 
        }
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: data.message === "Invalid username or password." ? data.message : "Oops! Login failed. Please check your credentials or try again.",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Login Error",
        description: error.message || "Oh no! Something went wrong during login. Please try again in a moment.",
      });
    },
  });

  // Mutation for Sign Up
  const signUpMutation = useMutation({
    mutationFn: handleSignUp,
    onSuccess: (data) => {
      if (data.success && data.user) {
        const authUser = data.user as AuthUser;
        saveAuthUser(authUser);
        
        // Initialize basic user details and set onboarding to false
        saveUserDetails(authUser.id, { 
            primaryHealthGoal: "Improve Overall Health", // Default placeholder
            dietaryRestrictions: {},
            foodPreferences: "",
            cookingTimePreference: "Flexible (any duration)",
            lifestyleInfo: "",
            // profilePictureDataUrl will be set later
        });
        setOnboardingComplete(authUser.id, false);
        
        toast({
          title: "Sign Up Successful!",
          description: "Welcome! Please complete your profile.",
        });
        router.push('/onboarding'); // Redirect to onboarding after successful sign up
      } else {
        let description = "Yikes! Sign up didn't work. Please check your details and try again.";
        if (data.message?.includes("Email already exists")) {
            description = "It looks like that email is already registered. Try logging in or use a different email!";
        } else if (data.message?.includes("Username is already taken")) {
            description = "That username is already taken. How about a different one?";
        } else if (data.message) {
            description = data.message;
        }
        toast({
          variant: "destructive",
          title: "Sign Up Failed",
          description: description,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Sign Up Error",
        description: error.message || "Oh snap! An error occurred while creating your account. Please try again.",
      });
    },
  });

  const onLoginSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const onSignUpSubmit = (data: SignUpFormData) => {
    signUpMutation.mutate(data);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md">
      <Card className="w-full shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Leaf className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Welcome to Nutri AI</CardTitle>
          <CardDescription>Your personalized nutrition journey starts here.</CardDescription>
        </CardHeader>
        <CardContent>
          {loginMutation.isError && !loginMutation.error.message.includes("Invalid username or password") && ( 
            <Alert variant="destructive" className="mb-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Login Error</AlertTitle>
              <AlertDescription>{loginMutation.error.message}</AlertDescription>
            </Alert>
          )}
           {signUpMutation.isError && (
            <Alert variant="destructive" className="mb-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Sign Up Error</AlertTitle>
              <AlertDescription>{signUpMutation.error.message}</AlertDescription>
            </Alert>
          )}
          <AuthTabs 
            onLoginSubmit={onLoginSubmit} 
            isLoginPending={loginMutation.isPending}
            onSignUpSubmit={onSignUpSubmit}
            isSignUpPending={signUpMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}

