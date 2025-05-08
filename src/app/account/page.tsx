
"use client";

import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { User, Edit3, Shield, Settings, Trash2, Camera } from "lucide-react";
import { AccountForm } from "@/components/account/AccountForm";
import type { AccountSettingsFormData } from "@/lib/schemas/authSchemas";
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

export default function AccountPage() {
  const { toast } = useToast();
  const [profilePic, setProfilePic] = useState<string>("https://picsum.photos/seed/profile/200/200");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Simulate fetching user data
  const [currentUser, setCurrentUser] = useState<AccountSettingsFormData>({
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
      other: "No spicy food",
    },
  });

  const handleProfileUpdate = async (data: AccountSettingsFormData) => {
    // Simulate API call
    console.log("Updating profile:", data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setCurrentUser(data); // Update local state
    toast({
      title: "Profile Updated",
      description: "Your account details have been saved.",
    });
  };

  const handleChangePassword = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "Password Change Initiated (Simulation)",
      description: "In a real app, you'd be redirected or shown a modal.",
    });
  };

  const handleDeleteAccount = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      variant: "destructive",
      title: "Account Deletion Initiated (Simulation)",
      description: "Your account deletion process has started.",
    });
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
            description: "Your new profile picture has been set.",
          });
        }, 1500);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };


  return (
    <div className="container mx-auto py-4 md:py-8 space-y-8">
      <header className="text-center">
        <User className="mx-auto h-12 w-12 md:h-16 md:w-16 text-accent mb-3 md:mb-4" />
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Account Settings</h1>
        <p className="mt-2 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Manage your profile, preferences, and security settings.
        </p>
      </header>

      {/* Profile Picture and Basic Info Card */}
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
              disabled={isUploading}
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
              disabled={isUploading}
            />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-semibold text-foreground">{currentUser.username}</h2>
            <p className="text-muted-foreground">{currentUser.email}</p>
            <p className="text-sm text-primary mt-1">{currentUser.primaryHealthGoal}</p>
          </div>
        </CardContent>
      </Card>

      {/* Account Details Form Card */}
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl flex items-center">
            <User className="mr-2 h-6 w-6 text-primary" /> Personal Information
          </CardTitle>
          <CardDescription>Update your personal details and dietary preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <AccountForm onSubmit={handleProfileUpdate} initialData={currentUser} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Preferences Card */}
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

        {/* Security Card */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl flex items-center">
              <Shield className="mr-2 h-6 w-6 text-primary" /> Security
            </CardTitle>
            <CardDescription>Manage your account security.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleChangePassword} variant="outline" className="w-full">
              Change Password
            </Button>
            <p className="text-sm text-muted-foreground">
              Two-Factor Authentication (2FA) and other security features will be available soon.
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Danger Zone Card */}
      <Card className="shadow-xl border-destructive">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl flex items-center text-destructive">
            <Trash2 className="mr-2 h-6 w-6" /> Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">Delete Account</Button>
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
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                  Yes, delete account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Please be certain before proceeding.
          </p>
        </CardContent>
      </Card>

    </div>
  );
}
