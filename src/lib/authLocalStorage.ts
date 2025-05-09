
// src/lib/authLocalStorage.ts
'use client'; // Local storage is a client-side API

import type { AccountSettingsFormData, cookingTimePreferences, healthGoals, commonDietaryRestrictions } from "@/lib/schemas/authSchemas";
import type { SymptomLogFormValues } from "@/lib/schemas/appSchemas";

const AUTH_USER_KEY = "nutriAIAuthUser";
const USER_DETAILS_PREFIX = "nutriAIUserDetails_";
const CHAT_HISTORY_PREFIX = "nutriAIChatHistory_";
const SYMPTOM_LOGS_PREFIX = "nutriAISymptomLogs_";
const ONBOARDING_COMPLETE_PREFIX = "nutriAIOnboardingComplete_";


export interface AuthUser {
  id: string;
  username: string;
  email: string;
}

// StoredUserDetails will store parts of AccountSettingsFormData not in AuthUser, plus profile pic
export interface StoredUserDetails {
  primaryHealthGoal?: typeof healthGoals[number];
  dietaryRestrictions?: {
      [K in keyof typeof commonDietaryRestrictions]?: boolean;
  } & { other?: string };
  profilePictureDataUrl?: string;
  foodPreferences?: string;
  cookingTimePreference?: typeof cookingTimePreferences[number];
  lifestyleInfo?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  suggestions?: string[];
}

export interface SymptomLogEntry extends SymptomLogFormValues {
  id: string; // Unique ID for the log entry
  loggedAt: string; // ISO string timestamp when the log was created by the user
}


// --- Auth User ---
export function saveAuthUser(user: AuthUser): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }
}

export function getAuthUser(): AuthUser | null {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem(AUTH_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }
  return null;
}

export function removeAuthUser(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_USER_KEY);
  }
}

// --- User Details (Profile, Settings) ---
export function saveUserDetails(userId: string, details: StoredUserDetails): void {
  if (typeof window !== 'undefined') {
    const existingDetails = getUserDetails(userId) || {};
    const updatedDetails = { ...existingDetails, ...details };
    localStorage.setItem(`${USER_DETAILS_PREFIX}${userId}`, JSON.stringify(updatedDetails));
  }
}

export function getUserDetails(userId: string): StoredUserDetails | null {
  if (typeof window !== 'undefined') {
    const detailsStr = localStorage.getItem(`${USER_DETAILS_PREFIX}${userId}`);
    return detailsStr ? JSON.parse(detailsStr) : null;
  }
  return null;
}

export function removeUserDetails(userId: string): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(`${USER_DETAILS_PREFIX}${userId}`);
    }
}


// --- Chat History ---
export function saveChatHistory(userId: string, history: ChatMessage[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`${CHAT_HISTORY_PREFIX}${userId}`, JSON.stringify(history));
  }
}

export function getChatHistory(userId: string): ChatMessage[] { // Return empty array if not found
  if (typeof window !== 'undefined') {
    const historyStr = localStorage.getItem(`${CHAT_HISTORY_PREFIX}${userId}`);
    return historyStr ? JSON.parse(historyStr) : []; 
  }
  return [];
}

export function removeChatHistory(userId: string): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(`${CHAT_HISTORY_PREFIX}${userId}`);
    }
}

// --- Symptom Logs ---
export function saveSymptomLog(userId: string, logEntry: SymptomLogFormValues): void {
  if (typeof window !== 'undefined') {
    const logs = getSymptomLogs(userId);
    const newLog: SymptomLogEntry = {
      ...logEntry,
      id: Date.now().toString(), // Simple unique ID
      loggedAt: new Date().toISOString(),
    };
    logs.push(newLog);
    localStorage.setItem(`${SYMPTOM_LOGS_PREFIX}${userId}`, JSON.stringify(logs));
  }
}

export function getSymptomLogs(userId: string): SymptomLogEntry[] {
  if (typeof window !== 'undefined') {
    const logsStr = localStorage.getItem(`${SYMPTOM_LOGS_PREFIX}${userId}`);
    return logsStr ? JSON.parse(logsStr) : [];
  }
  return [];
}

export function removeSymptomLogs(userId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`${SYMPTOM_LOGS_PREFIX}${userId}`);
  }
}

// --- Onboarding Status ---
export function setOnboardingComplete(userId: string, complete: boolean): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`${ONBOARDING_COMPLETE_PREFIX}${userId}`, JSON.stringify(complete));
  }
}

export function getOnboardingComplete(userId: string): boolean {
  if (typeof window !== 'undefined') {
    const statusStr = localStorage.getItem(`${ONBOARDING_COMPLETE_PREFIX}${userId}`);
    return statusStr ? JSON.parse(statusStr) : false;
  }
  return false;
}

export function removeOnboardingComplete(userId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`${ONBOARDING_COMPLETE_PREFIX}${userId}`);
  }
}


// --- Combined Logout ---
export function clearUserSession(userId?: string): void {
    removeAuthUser();
    if (userId) {
        removeUserDetails(userId);
        removeChatHistory(userId);
        removeSymptomLogs(userId);
        removeOnboardingComplete(userId);
    }
}

