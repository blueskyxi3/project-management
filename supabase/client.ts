/**
 * Supabase Client Configuration
 * Configure this with your Supabase project credentials
 */

import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage,
    flowType: 'pkce', // Use PKCE for better security
  },
});

// ============================================
// Storage Helpers
// ============================================

export const STORAGE_BUCKETS = {
  PROJECT_DOCUMENTS: 'project-documents',
  USER_AVATARS: 'user-avatars',
} as const;

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
  options?: { cacheControl?: string; upsert?: boolean }
): Promise<{ data: any; error: any }> {
  return supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: options?.cacheControl || '3600',
      upsert: options?.upsert || true,
    });
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(
  bucket: string,
  path: string
): Promise<{ data: any; error: any }> {
  return supabase.storage.from(bucket).remove([path]);
}

/**
 * Get a public URL for a file
 */
export function getPublicUrl(
  bucket: string,
  path: string
): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Download a file
 */
export async function downloadFile(
  bucket: string,
  path: string
): Promise<{ data: Blob | null; error: any }> {
  return supabase.storage.from(bucket).download(path);
}

// ============================================
// Auth Helpers
// ============================================

/**
 * Get current user session
 */
export async function getCurrentSession() {
  return supabase.auth.getSession();
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  return supabase.auth.getUser();
}

/**
 * Sign up a new user
 */
export async function signUp(email: string, password: string, options?: { data?: any }) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: options?.data,
    },
  });
}

/**
 * Sign in a user
 */
export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({
    email,
    password,
  });
}

/**
 * Sign out current user
 */
export async function signOut() {
  return supabase.auth.signOut();
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback);
}

/**
 * Reset password
 */
export async function resetPassword(email: string) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
}

/**
 * Update password
 */
export async function updatePassword(newPassword: string) {
  return supabase.auth.updateUser({ password: newPassword });
}

// ============================================
// Real-time Helpers
// ============================================

/**
 * Subscribe to table changes
 */
export function subscribeToTable(
  table: string,
  filter: { column: string; value: any },
  callback: (payload: any) => void
) {
  return supabase
    .channel(`${table}-changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        filter: `${filter.column}=eq.${filter.value}`,
      },
      callback
    )
    .subscribe();
}

export default supabase;
