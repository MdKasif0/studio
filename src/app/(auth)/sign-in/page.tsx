
"use client"; // Required for useMutation and client components

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
import { saveAuthUser, type AuthUser } from '@/lib/authLocalStorage';
import type { AccountSettingsFormData } from "@/lib/schemas/authSchemas";


export default function SignInPage() {
  const { toast } = useToast();
  const router = useRouter();

  // Mutation for Login
  const loginMutation = useMutation({
    mutationFn: handleLogin,
    onSuccess: (data) => {
      if (data.success && data.user) {
        saveAuthUser(data.user as AuthUser); // Assuming data.user matches AuthUser structure
        toast({
          title: "Login Successful!",
          description: data.message,
        });
        router.push('/'); // Redirect to dashboard/homepage
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: data.message,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Login Error",
        description: error.message || "An unexpected error occurred during login.",
      });
    },
  });

  // Mutation for Sign Up
  const signUpMutation = useMutation({
    mutationFn: handleSignUp,
    onSuccess: (data) => {
      if (data.success && data.user) {
        // Save basic auth user info. Full profile details (healthGoal, restrictions)
        // will be set up upon first visit to account page or through a dedicated onboarding step.
        saveAuthUser(data.user as AuthUser);
        
        toast({
          title: "Sign Up Successful!",
          description: data.message + " Redirecting to login...",
        });
        // For this setup, redirect to login after sign up.
        // Or, directly log them in and redirect to '/'
        // For simplicity, let's redirect to login to use the login flow
        setTimeout(() => router.push('/sign-in?tab=login'), 2000); 
        // A better UX might auto-login and push to '/'
        // router.push('/');
      } else {
        toast({
          variant: "destructive",
          title: "Sign Up Failed",
          description: data.message,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Sign Up Error",
        description: error.message || "An unexpected error occurred during sign up.",
      });
    },
  });

  const onLoginSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const onSignUpSubmit = (data: SignUpFormData) => {
    // The SignUpFormData contains more details than AuthUser.
    // The backend `handleSignUp` should return an AuthUser compatible object.
    // The additional details (healthGoal, restrictions) from SignUpFormData
    // would typically be saved to a database and then fetched for `StoredUserDetails`.
    // For now, we only save the AuthUser part from the response.
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
          {loginMutation.isError && !loginMutation.error.message.includes("Invalid username or password") && ( // Show general errors not specific to creds
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
