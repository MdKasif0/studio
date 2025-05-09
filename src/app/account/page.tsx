
"use client";

import React, { useState, useEffect } from 'react';
import { useMutation } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { User, Edit3, Shield, Settings, Trash2, Camera, Terminal, KeyRound, Loader2 } from "lucide-react"; // Added Loader2
import { AccountForm } from "@/components/account/AccountForm";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";
import type { AccountSettingsFormData, ChangePasswordFormData } from "@/lib/schemas/authSchemas";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggleButton } from '@/components/layout/ThemeToggleButton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle as UiAlertTitle } from "@/components/ui/alert"; // Renamed AlertTitle to avoid conflict
import { handleAccountUpdate, handleChangePasswordAction, handleDeleteAccountAction } from "@/lib/actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import type { Metadata } from "next"; // Not used directly in client component

// export const metadata: Metadata = { // This won't work directly in a "use client" component.
//   title: "Account Settings - Manage Your Profile | Nutri AI",
//   description: "Manage your Nutri AI profile, dietary preferences, login credentials, and app settings.",
//   robots: { // Specific robots directive for this page
//     index: false, // Do not index account settings
//     follow: false,
//   },
// };


export default function AccountPage() {
  const { toast } = useToast();
  const [profilePic, setProfilePic] = useState<string>("https://picsum.photos/seed/profile/200/200");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  // Simulate fetching user data - in a real app, this would come from auth context or API
  const [currentUser, setCurrentUser] = useState<AccountSettingsFormData | undefined>(undefined);

  useEffect(() => {
    // Simulate fetching current user data
    setTimeout(() => {
      setCurrentUser({
        username: "NutriUser123",
        email: "user@example.com",
        primaryHealthGoal: "Improve Overall Health",
        dietaryRestrictions: {
          glutenFree: false,
          dairyFree: true,
          vegetarian: false,
          vegan: false,
          nutAllergy: false,
          shellfishAllergy: false,
          soyAllergy: false,
          lowCarb: false,
          keto: false,
          paleo: false,
          lowFodmap: false,
          other: "No spicy food",
        },
      });
    }, 500);
  }, []);

  const profileUpdateMutation = useMutation({
    mutationFn: handleAccountUpdate,
    onSuccess: (response, variables) => {
      if (response.success) {
        setCurrentUser(variables); // Update local state with the data sent to mutation
        toast({
          title: "Profile Updated",
          description: response.message,
        });
      } else {
         toast({ variant: "destructive", title: "Update Failed", description: response.message });
      }
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Update Error",
        description: error.message,
      });
    },
  });

  const passwordChangeMutation = useMutation({
    mutationFn: handleChangePasswordAction,
    onSuccess: (response) => {
      toast({
        title: response.success ? "Password Changed" : "Password Change Failed",
        description: response.message,
        variant: response.success ? "default" : "destructive",
      });
      if (response.success) {
        setIsPasswordDialogOpen(false); 
      }
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Password Change Error",
        description: error.message,
      });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: handleDeleteAccountAction,
    onSuccess: (response) => {
      toast({
        title: response.success ? "Account Deletion Initiated" : "Deletion Failed",
        description: response.message,
        variant: response.success ? "default" : "destructive",
      });
      if (response.success) {
        // TODO: Log user out, redirect to home/login page
        console.log("User account deleted. Implement logout and redirect.");
      }
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Deletion Error",
        description: error.message,
      });
    },
  });

  const onProfileSubmit = (data: AccountSettingsFormData) => {
    profileUpdateMutation.mutate(data);
  };

  const onChangePasswordSubmit = (data: ChangePasswordFormData) => {
    passwordChangeMutation.mutate(data);
  };

  const onDeleteAccountConfirm = () => {
    deleteAccountMutation.mutate();
  };


  const handleProfilePicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        // Simulate upload
        setTimeout(() => {
          setProfilePic(reader.result as string);
          setIsUploading(false);
          toast({
            title: "Profile Picture Updated",
            description: "Your new profile picture has been set (simulation).",
          });
          // In a real app, call a server action here:
          // profilePicUploadMutation.mutate({imageDataUrl: reader.result as string})
        }, 1500);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto py-8 text-center">
        <User className="mx-auto h-16 w-16 text-accent mb-4 animate-pulse" />
        <p className="text-muted-foreground">Loading account details...</p>
      </div>
    );
  }


  return (
    <div className="container mx-auto py-4 md:py-8 space-y-8">
      <header className="text-center">
        <User className="mx-auto h-12 w-12 md:h-16 md:w-16 text-accent mb-3 md:mb-4" />
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Account Settings</h1>
        <p className="mt-2 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Manage your profile, preferences, and security settings.
        </p>
      </header>

      <Card className="shadow-xl overflow-hidden">
        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="relative group">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-primary group-hover:opacity-80 transition-opacity">
              <AvatarImage src={profilePic} alt="User profile picture" data-ai-hint="profile avatar" />
              <AvatarFallback className="text-4xl">
                {currentUser.username ? currentUser.username.substring(0, 2).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="outline"
              size="icon"
              className="absolute bottom-0 right-0 rounded-full bg-background/80 group-hover:bg-background text-foreground"
              onClick={triggerFileSelect}
              disabled={isUploading || profileUpdateMutation.isPending}
              aria-label="Change profile picture"
            >
              {isUploading ? <Camera className="h-5 w-5 animate-pulse" /> : <Edit3 className="h-5 w-5" />}
            </Button>
            <Input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleProfilePicChange}
              disabled={isUploading || profileUpdateMutation.isPending}
            />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-semibold text-foreground">{currentUser.username}</h2>
            <p className="text-muted-foreground">{currentUser.email}</p>
            <p className="text-sm text-primary mt-1">{currentUser.primaryHealthGoal}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl flex items-center">
            <User className="mr-2 h-6 w-6 text-primary" /> Personal Information
          </CardTitle>
          <CardDescription>Update your personal details and dietary preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          {profileUpdateMutation.isError && (
            <Alert variant="destructive" className="mb-4">
              <Terminal className="h-4 w-4" />
              <UiAlertTitle>Error</UiAlertTitle>
              <AlertDescription>{profileUpdateMutation.error.message}</AlertDescription>
            </Alert>
          )}
          <AccountForm 
            onSubmit={onProfileSubmit} 
            initialData={currentUser} 
            isPending={profileUpdateMutation.isPending} 
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl flex items-center">
              <Settings className="mr-2 h-6 w-6 text-primary" /> App Preferences
            </CardTitle>
            <CardDescription>Customize your app experience.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-foreground">Theme</span>
              <ThemeToggleButton />
            </div>
            <p className="text-sm text-muted-foreground">
              Notification settings and other app preferences will be available here soon.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl flex items-center">
              <Shield className="mr-2 h-6 w-6 text-primary" /> Security
            </CardTitle>
            <CardDescription>Manage your account security.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <KeyRound className="mr-2 h-4 w-4" /> Change Password
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                </DialogHeader>
                {passwordChangeMutation.isError && (
                   <Alert variant="destructive" className="mt-2 mb-4">
                     <Terminal className="h-4 w-4" />
                     <UiAlertTitle>Error</UiAlertTitle>
                     <AlertDescription>{passwordChangeMutation.error.message}</AlertDescription>
                   </Alert>
                )}
                <ChangePasswordForm onSubmit={onChangePasswordSubmit} isPending={passwordChangeMutation.isPending} />
              </DialogContent>
            </Dialog>
            <p className="text-sm text-muted-foreground">
              Two-Factor Authentication (2FA) and other security features will be available soon.
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-xl border-destructive">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl flex items-center text-destructive">
            <Trash2 className="mr-2 h-6 w-6" /> Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full" disabled={deleteAccountMutation.isPending}>
                {deleteAccountMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDeleteAccountConfirm} className="bg-destructive hover:bg-destructive/90">
                  Yes, delete account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {deleteAccountMutation.isError && (
             <Alert variant="destructive" className="mt-4">
               <Terminal className="h-4 w-4" />
               <UiAlertTitle>Error</UiAlertTitle>
               <AlertDescription>{deleteAccountMutation.error.message}</AlertDescription>
             </Alert>
          )}
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Please be certain before proceeding.
          </p>
        </CardContent>
      </Card>

    </div>
  );
}
