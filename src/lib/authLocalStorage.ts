// src/lib/authLocalStorage.ts
'use client'; // Local storage is a client-side API

import type { AccountSettingsFormData } from "@/lib/schemas/authSchemas";
import type { HomeDashboardOutput } from "@/ai/flows/home-dashboard-flow";
import type { GenerateCustomMealPlanOutput } from "@/ai/flows/generate-custom-meal-plan";
import type { SymptomLogFormValues } from "@/lib/schemas/appSchemas";

const AUTH_USER_KEY = "nutriAIAuthUser";
const USER_DETAILS_PREFIX = "nutriAIUserDetails_";
const CHAT_HISTORY_PREFIX = "nutriAIChatHistory_";
const API_KEY_PREFIX = "nutriAIUserApiKey_";
const HOME_DASHBOARD_CACHE_PREFIX = "nutriAIHomeDashboard_";
const SYMPTOM_LOG_PREFIX = "nutriAISymptomLog_";
const CACHED_MEAL_PLAN_PREFIX = "nutriAICachedMealPlan_";


export interface AuthUser {
  id: string;
  username: string;
  email: string;
}

// StoredUserDetails will store parts of AccountSettingsFormData not in AuthUser, plus profile pic
export interface StoredUserDetails extends Omit<AccountSettingsFormData, 'username' | 'email'> {
  profilePictureDataUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  suggestions?: string[];
}

export interface HomeDashboardCache {
  timestamp: number;
  data: HomeDashboardOutput;
}

export interface SymptomLogEntry extends SymptomLogFormValues {
  id: string; // Unique ID for the log entry
  loggedAt: string; // ISO string timestamp when the log was created by the user action
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
    localStorage.setItem(`${USER_DETAILS_PREFIX}${userId}`, JSON.stringify(details));
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

export function getChatHistory(userId: string): ChatMessage[] | null {
  if (typeof window !== 'undefined') {
    const historyStr = localStorage.getItem(`${CHAT_HISTORY_PREFIX}${userId}`);
    return historyStr ? JSON.parse(historyStr) : []; // Return empty array if not found for easier handling
  }
  return [];
}

export function removeChatHistory(userId: string): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(`${CHAT_HISTORY_PREFIX}${userId}`);
    }
}

// --- User API Key ---
export function saveApiKey(userId: string, apiKey: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`${API_KEY_PREFIX}${userId}`, apiKey);
  }
}

export function getApiKey(userId: string): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(`${API_KEY_PREFIX}${userId}`);
  }
  return null;
}

export function removeApiKey(userId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`${API_KEY_PREFIX}${userId}`);
  }
}

// --- Home Dashboard Cache ---
export function saveHomeDashboardData(userId: string, data: HomeDashboardOutput): void {
  if (typeof window !== 'undefined') {
    const cacheEntry: HomeDashboardCache = {
      timestamp: new Date().getTime(),
      data: data,
    };
    localStorage.setItem(`${HOME_DASHBOARD_CACHE_PREFIX}${userId}`, JSON.stringify(cacheEntry));
  }
}

export function getHomeDashboardData(userId: string): HomeDashboardCache | null {
  if (typeof window !== 'undefined') {
    const cacheStr = localStorage.getItem(`${HOME_DASHBOARD_CACHE_PREFIX}${userId}`);
    return cacheStr ? JSON.parse(cacheStr) : null;
  }
  return null;
}

export function removeHomeDashboardData(userId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`${HOME_DASHBOARD_CACHE_PREFIX}${userId}`);
  }
}

// --- Symptom Logs ---
export function saveSymptomLog(userId: string, logEntry: SymptomLogFormValues): void {
  if (typeof window !== 'undefined') {
    const logs = getSymptomLogs(userId);
    const newLog: SymptomLogEntry = {
      ...logEntry,
      id: `symptom_${new Date().getTime()}_${Math.random().toString(36).substring(2, 7)}`,
      loggedAt: new Date().toISOString(),
    };
    logs.push(newLog);
    // Sort logs by logTime descending (most recent first) before saving
    logs.sort((a, b) => new Date(b.logTime).getTime() - new Date(a.logTime).getTime());
    localStorage.setItem(`${SYMPTOM_LOG_PREFIX}${userId}`, JSON.stringify(logs));
  }
}

export function getSymptomLogs(userId: string): SymptomLogEntry[] {
  if (typeof window !== 'undefined') {
    const logsStr = localStorage.getItem(`${SYMPTOM_LOG_PREFIX}${userId}`);
    return logsStr ? JSON.parse(logsStr) : [];
  }
  return [];
}

export function removeSymptomLogs(userId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`${SYMPTOM_LOG_PREFIX}${userId}`);
  }
}

// --- Cached Meal Plan ---
export function saveCachedMealPlan(userId: string, plan: GenerateCustomMealPlanOutput): void {
  if (typeof window !== 'undefined') {
    // Could add a timestamp here if we want to expire old cached plans automatically
    localStorage.setItem(`${CACHED_MEAL_PLAN_PREFIX}${userId}`, JSON.stringify(plan));
  }
}

export function getCachedMealPlan(userId: string): GenerateCustomMealPlanOutput | null {
  if (typeof window !== 'undefined') {
    const planStr = localStorage.getItem(`${CACHED_MEAL_PLAN_PREFIX}${userId}`);
    return planStr ? JSON.parse(planStr) : null;
  }
  return null;
}

export function removeCachedMealPlan(userId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`${CACHED_MEAL_PLAN_PREFIX}${userId}`);
  }
}


// --- Combined Logout ---
export function clearUserSession(userId?: string): void {
    removeAuthUser();
    if (userId) {
        removeUserDetails(userId);
        removeChatHistory(userId);
        removeApiKey(userId);
        removeHomeDashboardData(userId);
        removeSymptomLogs(userId);
        removeCachedMealPlan(userId); // Added cached meal plan removal
        localStorage.removeItem(`onboardingComplete_${userId}`); // Remove onboarding flag
    }
}