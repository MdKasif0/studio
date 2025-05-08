"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "./LoginForm";
import { SignUpForm } from "./SignUpForm";
import type { LoginFormData, SignUpFormData } from "@/lib/schemas/authSchemas";

interface AuthTabsProps {
  onLoginSubmit: (data: LoginFormData) => void;
  isLoginPending: boolean;
  onSignUpSubmit: (data: SignUpFormData) => void;
  isSignUpPending: boolean;
}

export function AuthTabs({ 
  onLoginSubmit, 
  isLoginPending, 
  onSignUpSubmit, 
  isSignUpPending 
}: AuthTabsProps) {
  return (
    <Tabs defaultValue="login" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        <LoginForm onSubmit={onLoginSubmit} isPending={isLoginPending} />
      </TabsContent>
      <TabsContent value="signup">
        <SignUpForm onSubmit={onSignUpSubmit} isPending={isSignUpPending} />
      </TabsContent>
    </Tabs>
  );
}