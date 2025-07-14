import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = "https://ntzcqfphhsuddtbugiqd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50emNxZnBoaHN1ZGR0YnVnaXFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0NjY5NjUsImV4cCI6MjA2ODA0Mjk2NX0.1saAtNicrVC3-cCdh239Jr-hNQ7c9wnvuwzovIJkWQw";

// Extension-specific Supabase client with custom storage
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: {
      // Custom storage implementation for Chrome extension
      getItem: async (key: string) => {
        const result = await chrome.storage.local.get([key]);
        return result[key] || null;
      },
      setItem: async (key: string, value: string) => {
        await chrome.storage.local.set({ [key]: value });
      },
      removeItem: async (key: string) => {
        await chrome.storage.local.remove([key]);
      },
    },
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Extension-specific auth utilities
export const authUtils = {
  // Get current session from storage
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  // Sign in user
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign up user
  async signUp(email: string, password: string, fullName?: string) {
    const redirectUrl = `${chrome.runtime.getURL('popup.html')}`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: fullName ? { full_name: fullName } : undefined,
      },
    });
    return { data, error };
  },

  // Sign out user
  async signOut() {
    const { error } = await supabase.auth.signOut();
    // Clear extension storage
    await chrome.storage.local.clear();
    return { error };
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (session: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session);
    });
  },
};

// Database utilities for extension
export const dbUtils = {
  // Get user profile
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    return { data, error };
  },

  // Get usage stats for today
  async getTodayStats(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('usage_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();
    return { data, error };
  },

  // Update usage stats
  async updateUsageStats(userId: string, optimizedCount: number) {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('usage_stats')
      .upsert({
        user_id: userId,
        date: today,
        optimized_count: optimizedCount,
      })
      .select()
      .single();
    return { data, error };
  },

  // Get user preferences
  async getUserPreferences(userId: string) {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    return { data, error };
  },

  // Update user preferences
  async updateUserPreferences(userId: string, preferences: any) {
    const { data, error } = await supabase
      .from('user_preferences')
      .update(preferences)
      .eq('user_id', userId)
      .select()
      .single();
    return { data, error };
  },
};

// Logging utility for extension
export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[SubjectAI] ${message}`, data);
  },
  error: (message: string, error?: any) => {
    console.error(`[SubjectAI Error] ${message}`, error);
  },
  warn: (message: string, data?: any) => {
    console.warn(`[SubjectAI Warning] ${message}`, data);
  },
};