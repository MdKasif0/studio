// src/lib/authLocalStorage.ts
'use client'; // Local storage is a client-side API

import type { AccountSettingsFormData } from "@/lib/schemas/authSchemas";
import type { HomeDashboardOutput } from "@/ai/flows/home-dashboard-flow";
import type { GenerateCustomMealPlanOutput } from "@/ai/flows/generate-custom-meal-plan";
import type { SymptomLogFormValues } from "@/lib/schemas/appSchemas";

const AUTH_USER_KEY = "nutriAIAuthUser";
const USER_DETAILS_PREFIX = "nutriAIUserDetails_";
const API_KEY_PREFIX = "nutriAIUserApiKey_";
const HOME_DASHBOARD_CACHE_PREFIX = "nutriAIHomeDashboard_";
const SYMPTOM_LOG_PREFIX = "nutriAISymptomLog_";
const CACHED_MEAL_PLAN_PREFIX = "nutriAICachedMealPlan_";
const DAILY_STREAK_PREFIX = "nutriAIDailyStreak_";
const UNLOCKED_BADGES_PREFIX = "nutriAIUnlockedBadges_";
const LAST_WEEKLY_SUMMARY_PREFIX = "nutriAILastWeeklySummary_";
const FAVORITE_RECIPES_PREFIX = "nutriAIFavoriteRecipes_";
const MEDICAL_DISCLAIMER_ACKNOWLEDGED_KEY_PREFIX = "nutriAIMedicalDisclaimerAcknowledged_";

// Chat specific keys
const CHAT_SESSIONS_PREFIX = "nutriAIChatSessions_";
const ACTIVE_CHAT_ID_PREFIX = "nutriAIActiveChatId_";
const CHAT_DRAFT_PREFIX = "nutriAIChatDraft_";
const PINNED_CHATS_PREFIX = "nutriAIPinnedChats_";
const AI_PERSONA_PREFIX = "nutriAIAiPersona_";
const CHAT_FEEDBACK_PREFIX = "nutriAIChatFeedback_";

const MAX_CHAT_SESSIONS = 50;

export interface AuthUser {
  id: string;
  username: string;
  email: string;
}

export interface StoredUserDetails extends Omit<AccountSettingsFormData, 'username' | 'email'> {
  profilePictureDataUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model" | "system"; // Added system role for initial/error messages
  content: string;
  timestamp: string; // ISO string
  suggestions?: string[];
  reaction?: string; // For emoji reactions
}

export interface ChatSession {
  id: string; // Unique ID for the chat session (e.g., timestamp-based)
  title: string; // e.g., "Chat from YYYY-MM-DD HH:mm" or first user message
  messages: ChatMessage[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  persona?: AIPersona; // Persona used for this chat
}

export interface HomeDashboardCache {
  timestamp: number;
  data: HomeDashboardOutput;
}

export interface SymptomLogEntry extends SymptomLogFormValues {
  id: string;
  loggedAt: string;
  isQuickLog?: boolean;
}

export interface DailyStreakData {
  lastLogDate: string;
  currentStreak: number;
}

export interface FavoriteRecipe {
  id: string;
  day?: string;
  mealName: string;
  dishName: string;
  recipeContent: string;
  servings?: number;
  notes?: string;
  substitutions?: string[];
  addedAt: string;
}

export type AIPersona = "Friendly Coach" | "Professional Nutritionist" | "Playful Chef";

export interface ChatFeedback {
  chatSessionId: string;
  type: 'suggestion' | 'misunderstanding';
  text: string;
  timestamp: string;
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

// --- User Details ---
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

// --- Chat Sessions ---
export function getAllChatSessions(userId: string): ChatSession[] {
  if (typeof window !== 'undefined') {
    const sessionsStr = localStorage.getItem(`${CHAT_SESSIONS_PREFIX}${userId}`);
    const sessions = sessionsStr ? JSON.parse(sessionsStr) : [];
    // Ensure sessions are sorted by updatedAt descending (most recent first)
    return sessions.sort((a: ChatSession, b: ChatSession) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }
  return [];
}

export function saveChatSession(userId: string, session: ChatSession): void {
  if (typeof window !== 'undefined') {
    let sessions = getAllChatSessions(userId);
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    if (existingIndex > -1) {
      sessions[existingIndex] = session;
    } else {
      sessions.unshift(session); // Add new session to the beginning
    }
    // Limit to MAX_CHAT_SESSIONS
    sessions = sessions.slice(0, MAX_CHAT_SESSIONS);
    localStorage.setItem(`${CHAT_SESSIONS_PREFIX}${userId}`, JSON.stringify(sessions));
  }
}

export function getChatSession(userId: string, sessionId: string): ChatSession | null {
  if (typeof window !== 'undefined') {
    const sessions = getAllChatSessions(userId);
    return sessions.find(s => s.id === sessionId) || null;
  }
  return null;
}

export function deleteChatSession(userId: string, sessionId: string): void {
  if (typeof window !== 'undefined') {
    let sessions = getAllChatSessions(userId);
    sessions = sessions.filter(s => s.id !== sessionId);
    localStorage.setItem(`${CHAT_SESSIONS_PREFIX}${userId}`, JSON.stringify(sessions));
    // If the deleted session was active, clear active chat ID
    const activeId = getActiveChatId(userId);
    if (activeId === sessionId) {
      removeActiveChatId(userId);
    }
  }
}

export function deleteAllChatSessions(userId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`${CHAT_SESSIONS_PREFIX}${userId}`);
    removeActiveChatId(userId);
    // Also clear pinned chats if all are deleted
    savePinnedChatIds(userId, []);
  }
}

export function setActiveChatId(userId: string, sessionId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`${ACTIVE_CHAT_ID_PREFIX}${userId}`, sessionId);
  }
}

export function getActiveChatId(userId: string): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(`${ACTIVE_CHAT_ID_PREFIX}${userId}`);
  }
  return null;
}

export function removeActiveChatId(userId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`${ACTIVE_CHAT_ID_PREFIX}${userId}`);
  }
}

// --- Chat Drafts ---
export function saveChatDraft(userId: string, sessionId: string, draft: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`${CHAT_DRAFT_PREFIX}${userId}_${sessionId}`, draft);
  }
}

export function getChatDraft(userId: string, sessionId: string): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(`${CHAT_DRAFT_PREFIX}${userId}_${sessionId}`);
  }
  return null;
}

export function removeChatDraft(userId: string, sessionId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`${CHAT_DRAFT_PREFIX}${userId}_${sessionId}`);
  }
}

// --- Pinned Chats ---
export function getPinnedChatIds(userId: string): string[] {
  if (typeof window !== 'undefined') {
    const idsStr = localStorage.getItem(`${PINNED_CHATS_PREFIX}${userId}`);
    return idsStr ? JSON.parse(idsStr) : [];
  }
  return [];
}

export function savePinnedChatIds(userId: string, ids: string[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`${PINNED_CHATS_PREFIX}${userId}`, JSON.stringify(ids));
  }
}

export function togglePinnedChat(userId: string, sessionId: string): void {
  if (typeof window !== 'undefined') {
    let pinnedIds = getPinnedChatIds(userId);
    if (pinnedIds.includes(sessionId)) {
      pinnedIds = pinnedIds.filter(id => id !== sessionId);
    } else {
      pinnedIds.unshift(sessionId); // Add to the beginning
    }
    savePinnedChatIds(userId, pinnedIds);
  }
}

// --- AI Persona ---
export function saveAIPersona(userId: string, persona: AIPersona): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`${AI_PERSONA_PREFIX}${userId}`, persona);
  }
}

export function getAIPersona(userId: string): AIPersona | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(`${AI_PERSONA_PREFIX}${userId}`) as AIPersona | null;
  }
  return null;
}

// --- Chat Feedback ---
export function saveChatFeedback(userId: string, feedback: ChatFeedback): void {
  if (typeof window !== 'undefined') {
    const feedbacks = getChatFeedbacks(userId);
    feedbacks.push(feedback);
    localStorage.setItem(`${CHAT_FEEDBACK_PREFIX}${userId}`, JSON.stringify(feedbacks));
  }
}

export function getChatFeedbacks(userId: string): ChatFeedback[] {
   if (typeof window !== 'undefined') {
    const fbStr = localStorage.getItem(`${CHAT_FEEDBACK_PREFIX}${userId}`);
    return fbStr ? JSON.parse(fbStr) : [];
  }
  return [];
}

// --- Export Chat History ---
export function exportChatHistory(userId: string): string {
  if (typeof window !== 'undefined') {
    const sessions = getAllChatSessions(userId);
    return JSON.stringify(sessions, null, 2);
  }
  return "[]";
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
export function saveSymptomLog(userId: string, logEntry: SymptomLogFormValues, isQuickLog: boolean = false): SymptomLogEntry {
  const newLog: SymptomLogEntry = {
    ...logEntry,
    id: `symptom_${new Date().getTime()}_${Math.random().toString(36).substring(2, 7)}`,
    loggedAt: new Date().toISOString(),
    isQuickLog: isQuickLog,
  };
  if (typeof window !== 'undefined') {
    const logs = getSymptomLogs(userId);
    logs.push(newLog);
    logs.sort((a, b) => new Date(b.logTime).getTime() - new Date(a.logTime).getTime());
    localStorage.setItem(`${SYMPTOM_LOG_PREFIX}${userId}`, JSON.stringify(logs));
  }
  return newLog;
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

// --- Daily Streak ---
export function getDailyStreakData(userId: string): DailyStreakData {
  if (typeof window !== 'undefined') {
    const dataStr = localStorage.getItem(`${DAILY_STREAK_PREFIX}${userId}`);
    return dataStr ? JSON.parse(dataStr) : { lastLogDate: '', currentStreak: 0 };
  }
  return { lastLogDate: '', currentStreak: 0 };
}

export function saveDailyStreakData(userId: string, data: DailyStreakData): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`${DAILY_STREAK_PREFIX}${userId}`, JSON.stringify(data));
  }
}

export function removeDailyStreakData(userId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`${DAILY_STREAK_PREFIX}${userId}`);
  }
}

// --- Unlocked Badges ---
export function getUnlockedBadges(userId: string): string[] {
  if (typeof window !== 'undefined') {
    const badgesStr = localStorage.getItem(`${UNLOCKED_BADGES_PREFIX}${userId}`);
    return badgesStr ? JSON.parse(badgesStr) : [];
  }
  return [];
}

export function saveUnlockedBadges(userId: string, badges: string[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`${UNLOCKED_BADGES_PREFIX}${userId}`, JSON.stringify(badges));
  }
}

export function addUnlockedBadge(userId: string, badgeName: string): void {
  if (typeof window !== 'undefined') {
    const badges = getUnlockedBadges(userId);
    if (!badges.includes(badgeName)) {
      badges.push(badgeName);
      saveUnlockedBadges(userId, badges);
    }
  }
}

export function removeUnlockedBadges(userId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`${UNLOCKED_BADGES_PREFIX}${userId}`);
  }
}

// --- Last Weekly Summary ---
export function getLastWeeklySummaryDate(userId: string): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(`${LAST_WEEKLY_SUMMARY_PREFIX}${userId}`);
  }
  return null;
}

export function saveLastWeeklySummaryDate(userId: string, date: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`${LAST_WEEKLY_SUMMARY_PREFIX}${userId}`, date);
  }
}

export function removeLastWeeklySummaryDate(userId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`${LAST_WEEKLY_SUMMARY_PREFIX}${userId}`);
  }
}

// --- Favorite Recipes ---
export function getFavoriteRecipes(userId: string): FavoriteRecipe[] {
  if (typeof window !== 'undefined') {
    const favStr = localStorage.getItem(`${FAVORITE_RECIPES_PREFIX}${userId}`);
    return favStr ? JSON.parse(favStr) : [];
  }
  return [];
}

export function saveFavoriteRecipe(userId: string, recipe: Omit<FavoriteRecipe, 'id' | 'addedAt'> & {id?: string}): FavoriteRecipe {
  if (typeof window !== 'undefined') {
    const favorites = getFavoriteRecipes(userId);
    const recipeId = recipe.id || `${recipe.mealName.replace(/\s+/g, '-')}-${recipe.dishName.replace(/\s+/g, '-')}-${Date.now()}`;
    const newFavorite: FavoriteRecipe = {
        ...recipe,
        id: recipeId,
        addedAt: new Date().toISOString(),
    };
    const existingIndex = favorites.findIndex(fav => fav.id === newFavorite.id);
    if (existingIndex > -1) {
      favorites[existingIndex] = newFavorite;
    } else {
      favorites.push(newFavorite);
    }
    localStorage.setItem(`${FAVORITE_RECIPES_PREFIX}${userId}`, JSON.stringify(favorites));
    return newFavorite;
  }
   return { ...recipe, id: recipe.id || 'error-id', addedAt: new Date().toISOString() } as FavoriteRecipe;
}

export function removeFavoriteRecipe(userId: string, recipeId: string): void {
  if (typeof window !== 'undefined') {
    let favorites = getFavoriteRecipes(userId);
    favorites = favorites.filter(fav => fav.id !== recipeId);
    localStorage.setItem(`${FAVORITE_RECIPES_PREFIX}${userId}`, JSON.stringify(favorites));
  }
}

export function isRecipeFavorite(userId: string, recipeId: string): boolean {
  if (typeof window !== 'undefined') {
    const favorites = getFavoriteRecipes(userId);
    return favorites.some(fav => fav.id === recipeId);
  }
  return false;
}

export function removeAllFavoriteRecipes(userId: string): void {
  if (typeof window !== 'undefined') {
      localStorage.removeItem(`${FAVORITE_RECIPES_PREFIX}${userId}`);
  }
}

// --- Medical Disclaimer Acknowledgement ---
export function hasAcknowledgedMedicalDisclaimer(userId: string, context: 'symptomLog' | 'restrictions'): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(`${MEDICAL_DISCLAIMER_ACKNOWLEDGED_KEY_PREFIX}${context}_${userId}`) === 'true';
  }
  return false;
}

export function acknowledgeMedicalDisclaimer(userId: string, context: 'symptomLog' | 'restrictions'): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`${MEDICAL_DISCLAIMER_ACKNOWLEDGED_KEY_PREFIX}${context}_${userId}`, 'true');
  }
}

// --- Combined Logout ---
export function clearUserSession(userId?: string): void {
    removeAuthUser();
    if (userId) {
        removeUserDetails(userId);
        // removeChatHistory(userId); // Old single chat history
        deleteAllChatSessions(userId); // New: clears all sessions and active ID
        removeApiKey(userId);
        removeHomeDashboardData(userId);
        removeSymptomLogs(userId);
        removeCachedMealPlan(userId);
        removeDailyStreakData(userId);
        removeUnlockedBadges(userId);
        removeLastWeeklySummaryDate(userId);
        removeAllFavoriteRecipes(userId);
        localStorage.removeItem(`onboardingComplete_${userId}`);
        localStorage.removeItem(`${MEDICAL_DISCLAIMER_ACKNOWLEDGED_KEY_PREFIX}symptomLog_${userId}`);
        localStorage.removeItem(`${MEDICAL_DISCLAIMER_ACKNOWLEDGED_KEY_PREFIX}restrictions_${userId}`);
        localStorage.removeItem(`${AI_PERSONA_PREFIX}${userId}`);
        localStorage.removeItem(`${CHAT_FEEDBACK_PREFIX}${userId}`);
        // Remove drafts for all sessions (though typically sessions are cleared anyway)
        // This part might be complex if many drafts exist; usually, deleting sessions handles it.
    }
}