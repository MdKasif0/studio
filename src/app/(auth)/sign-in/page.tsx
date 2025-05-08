
import { AuthTabs } from "@/components/auth/AuthTabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Leaf } from "lucide-react";

export default function SignInPage() {
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
          <AuthTabs />
        </CardContent>
      </Card>
    </div>
  );
}

