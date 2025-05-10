
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useMutation } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { User, Edit3, Shield, Settings, Trash2, Camera, Terminal, KeyRound, Loader2, LogOut, KeySquare, ShieldAlert, MessageSquareX } from "lucide-react";
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
  AlertDialogTitle as RadixAlertDialogTitle, 
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription as UiAlertDescription, AlertTitle as UiAlertTitle } from "@/components/ui/alert"; 
import { handleAccountUpdate, handleChangePasswordAction, handleDeleteAccountAction } from "@/lib/actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  getAuthUser, 
  saveUserDetails, 
  getUserDetails, 
  clearUserSession, 
  deleteAllChatSessions, // Added for clearing chat data
  type StoredUserDetails, 
  type AuthUser,
  saveApiKey,
  getApiKey,
  removeApiKey,
  hasAcknowledgedMedicalDisclaimer,
  acknowledgeMedicalDisclaimer
} from '@/lib/authLocalStorage';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';


export default function AccountPage() {
  const { toast } = useToast();
  const router = useRouter();
  
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [userDetails, setUserDetails] = useState<StoredUserDetails | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [userApiKeyInput, setUserApiKeyInput] = useState("");
  const [currentApiKeyDisplay, setCurrentApiKeyDisplay] = useState<string | null>(null);
  const [showAccountDisclaimer, setShowAccountDisclaimer] = useState(false);

  const maskApiKey = (key: string | null): string | null => {
    if (!key) return null;
    if (key.length <= 8) return "********";
    return `${key.substring(0, 4)}...${key.slice(-4)}`;
  };

  const loadDataFromLocalStorage = useCallback(() => {
    const currentAuthUser = getAuthUser();
    setAuthUser(currentAuthUser);
    if (currentAuthUser) {
      const storedDetails = getUserDetails(currentAuthUser.id);
      if (storedDetails) {
        setUserDetails(storedDetails);
        const hasRestrictions = Object.values(storedDetails.dietaryRestrictions || {}).some(val => val === true || (typeof val === 'string' && val.length > 0));
        if (hasRestrictions && !hasAcknowledgedMedicalDisclaimer(currentAuthUser.id, 'restrictions')) {
          setShowAccountDisclaimer(true);
        }
      } else {
        setUserDetails({
          primaryHealthGoal: "Improve Overall Health",
          dietaryRestrictions: {},
          profilePictureDataUrl: "https://picsum.photos/seed/profile/200/200"
        });
      }
      const storedApiKey = getApiKey(currentAuthUser.id);
      setCurrentApiKeyDisplay(maskApiKey(storedApiKey));
      if (storedApiKey) setUserApiKeyInput(storedApiKey); 
    }
    setIsLoadingData(false);
  }, []);

  useEffect(() => {
    loadDataFromLocalStorage();
  }, [loadDataFromLocalStorage]);


  const combinedUserDataForForm = React.useMemo(() => {
    if (!authUser) return undefined;
    return {
      username: authUser.username,
      email: authUser.email,
      primaryHealthGoal: userDetails?.primaryHealthGoal || "Improve Overall Health",
      dietaryRestrictions: userDetails?.dietaryRestrictions || {
          glutenFree: false, dairyFree: false, vegetarian: false, vegan: false,
          nutAllergy: false, shellfishAllergy: false, soyAllergy: false,
          lowCarb: false, keto: false, paleo: false, lowFodmap: false, other: "",
      },
    } as AccountSettingsFormData;
  }, [authUser, userDetails]);


  const profileUpdateMutation = useMutation({
    mutationFn: handleAccountUpdate,
    onSuccess: (response, submittedData) => {
      if (response.success && authUser) {
        if (authUser.username !== submittedData.username) {
            saveAuthUser({...authUser, username: submittedData.username });
            setAuthUser(prev => prev ? {...prev, username: submittedData.username} : null);
        }
        const newDetails: StoredUserDetails = {
          primaryHealthGoal: submittedData.primaryHealthGoal,
          dietaryRestrictions: submittedData.dietaryRestrictions,
          profilePictureDataUrl: userDetails?.profilePictureDataUrl, 
        };
        saveUserDetails(authUser.id, newDetails);
        setUserDetails(newDetails);
        toast({ title: "Profile Updated", description: response.message });

        const restrictionsChanged = JSON.stringify(userDetails?.dietaryRestrictions) !== JSON.stringify(submittedData.dietaryRestrictions);
        const hasNewRestrictions = Object.values(submittedData.dietaryRestrictions || {}).some(val => val === true || (typeof val === 'string' && val.length > 0));

        if (restrictionsChanged && hasNewRestrictions && !hasAcknowledgedMedicalDisclaimer(authUser.id, 'restrictions')) {
          setShowAccountDisclaimer(true);
        }

      } else {
         toast({ variant: "destructive", title: "Update Failed", description: response.message });
      }
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Update Error", description: error.message });
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
      if (response.success) setIsPasswordDialogOpen(false); 
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Password Change Error", description: error.message });
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
      if (response.success && authUser) {
        clearUserSession(authUser.id);
        router.push("/sign-in");
      }
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Deletion Error", description: error.message });
    },
  });

  const onProfileSubmit = (data: AccountSettingsFormData) => profileUpdateMutation.mutate(data);
  const onChangePasswordSubmit = (data: ChangePasswordFormData) => passwordChangeMutation.mutate(data);
  const onDeleteAccountConfirm = () => deleteAccountMutation.mutate();

  const handleProfilePicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && authUser) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const newProfilePicDataUrl = reader.result as string;
        setTimeout(() => {
          const updatedDetails: StoredUserDetails = {
            ...(userDetails || { primaryHealthGoal: "Improve Overall Health", dietaryRestrictions: {} }),
            profilePictureDataUrl: newProfilePicDataUrl,
          };
          saveUserDetails(authUser.id, updatedDetails);
          setUserDetails(updatedDetails);
          setIsUploading(false);
          toast({ title: "Profile Picture Updated", description: "Your new profile picture has been set." });
        }, 1000);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  const handleSaveApiKey = () => {
    if (authUser && userApiKeyInput.trim()) {
      saveApiKey(authUser.id, userApiKeyInput.trim());
      setCurrentApiKeyDisplay(maskApiKey(userApiKeyInput.trim()));
      toast({ title: "API Key Saved", description: "Your Gemini API key has been saved locally." });
    } else if (!userApiKeyInput.trim()) {
      toast({ variant: "destructive", title: "API Key Empty", description: "Please enter an API key to save." });
    }
  };

  const handleClearApiKey = () => {
    if (authUser) {
      removeApiKey(authUser.id);
      setUserApiKeyInput("");
      setCurrentApiKeyDisplay(null);
      toast({ title: "API Key Cleared", description: "Your Gemini API key has been removed from local storage." });
    }
  };

  const handleClearChatData = () => {
    if (authUser) {
      deleteAllChatSessions(authUser.id);
      toast({ title: "Chat Data Cleared", description: "Your AI Assistant chat history has been removed." });
    }
  };

  if (isLoadingData || !authUser || !combinedUserDataForForm) {
    return (
      <div className="container mx-auto py-8 text-center">
        <User className="mx-auto h-16 w-16 text-accent mb-4 animate-pulse" />
        <p className="text-muted-foreground">Loading account details...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 md:py-8 space-y-8">
       {showAccountDisclaimer && authUser && (
        <AlertDialog open={showAccountDisclaimer} onOpenChange={(open) => { if (!open) setShowAccountDisclaimer(false); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <RadixAlertDialogTitle className="flex items-center"><ShieldAlert className="h-5 w-5 mr-2 text-destructive" /> Important Disclaimer</RadixAlertDialogTitle>
              <AlertDialogDescription>
                Information regarding dietary restrictions is used for personalization. Nutri AI is not a medical tool. Always consult a healthcare provider for health concerns or before making health-related decisions.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => {
                acknowledgeMedicalDisclaimer(authUser.id, 'restrictions');
                setShowAccountDisclaimer(false);
              }} className="bg-primary hover:bg-primary/90">I Understand</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
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
              <AvatarImage src={userDetails?.profilePictureDataUrl || "https://picsum.photos/seed/profile/200/200"} alt="User profile picture" data-ai-hint="profile avatar" />
              <AvatarFallback className="text-4xl">
                {authUser.username ? authUser.username.substring(0, 2).toUpperCase() : 'U'}
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
            <h2 className="text-2xl font-semibold text-foreground">{authUser.username}</h2>
            <p className="text-muted-foreground">{authUser.email}</p>
            <p className="text-sm text-primary mt-1">{userDetails?.primaryHealthGoal}</p>
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
              <UiAlertDescription>{profileUpdateMutation.error.message}</UiAlertDescription>
            </Alert>
          )}
          <AccountForm 
            onSubmit={onProfileSubmit} 
            initialData={combinedUserDataForForm} 
            isPending={profileUpdateMutation.isPending} 
          />
        </CardContent>
      </Card>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl flex items-center">
            <KeySquare className="mr-2 h-6 w-6 text-primary" /> API Key Management
          </CardTitle>
          <CardDescription>Provide your own Google AI (Gemini) API key to use with Nutri AI features. This can help avoid rate limits on shared keys.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="gemini-api-key">Your Gemini API Key</Label>
            <Input 
              id="gemini-api-key" 
              type="password" 
              value={userApiKeyInput}
              onChange={(e) => setUserApiKeyInput(e.target.value)}
              placeholder="Enter your Gemini API Key" 
              className="mt-1"
            />
            {currentApiKeyDisplay && (
              <p className="text-xs text-muted-foreground mt-1">
                Current key: {currentApiKeyDisplay} (Stored locally in your browser)
              </p>
            )}
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleSaveApiKey} className="bg-accent hover:bg-accent/90 text-accent-foreground">Save API Key</Button>
            {currentApiKeyDisplay && (
              <Button variant="outline" onClick={handleClearApiKey}>Clear API Key</Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Your API key is stored locally in your browser and is only used for making requests to the Gemini API through this app. 
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline text-primary hover:text-primary/80 ml-1">Get a Gemini API key here.</a>
          </p>
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
             <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <MessageSquareX className="mr-2 h-4 w-4" /> Clear Chat Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <RadixAlertDialogTitle>Clear All Chat Data?</RadixAlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your AI Assistant chat history from your local browser storage. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearChatData} className="bg-destructive hover:bg-destructive/90">
                    Yes, clear chat data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
                     <UiAlertDescription>{passwordChangeMutation.error.message}</UiAlertDescription>
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
                <RadixAlertDialogTitle>Are you absolutely sure?</RadixAlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account and remove your data from our servers (simulated for local storage).
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
               <UiAlertDescription>{deleteAccountMutation.error.message}</UiAlertDescription>
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