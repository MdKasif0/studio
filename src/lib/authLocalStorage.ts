
// src/lib/authLocalStorage.ts
'use client'; // Local storage is a client-side API

import type { AccountSettingsFormData } from "@/lib/schemas/authSchemas";

const AUTH_USER_KEY = "nutriAIAuthUser";
const USER_DETAILS_PREFIX = "nutriAIUserDetails_";
const CHAT_HISTORY_PREFIX = "nutriAIChatHistory_";

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

// --- Combined Logout ---
export function clearUserSession(userId?: string): void {
    removeAuthUser();
    if (userId) {
        removeUserDetails(userId);
        removeChatHistory(userId);
    }
}
