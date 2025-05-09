
"use client";

import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getAuthUser, getOnboardingComplete } from "@/lib/authLocalStorage";

export default function OnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    const authUser = getAuthUser();
    if (!authUser) {
      router.replace("/sign-in"); // Should not happen if AppLayout protects this route
    } else if (getOnboardingComplete(authUser.id)) {
      router.replace("/"); // Already completed, redirect to home
    }
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 font-sans antialiased">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Leaf className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Welcome to Nutri AI!</CardTitle>
          <CardDescription>Let's personalize your nutrition journey. A few quick questions will help us tailor the perfect experience for you.</CardDescription>
        </CardHeader>
        <CardContent>
          <OnboardingWizard />
        </CardContent>
      </Card>
    </div>
  );
}
