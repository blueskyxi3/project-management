/**
 * Auth Service
 * Handles all authentication-related operations
 */

import { supabase, onAuthStateChange, signUp, signIn, signOut, getCurrentSession, getCurrentUser, resetPassword as resetPasswordAuth, updatePassword as updatePasswordAuth } from '../client';
import type { Profile, ProfileInsert, ProfileUpdate } from '../types';

// ============================================
// Session Management
// ============================================

/**
 * Get current session
 */
export async function getSession() {
  return getCurrentSession();
}

/**
 * Get current user with profile
 */
export async function getCurrentUserWithProfile() {
  const { data, error } = await getCurrentUser();
  console.log('getCurrentUserWithProfile', data, error);
  if (error || !data?.user) {
    return { user: null, profile: null, error };
  }

  // Fetch user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  return {
    user: data.user,
    profile: profile || null,
    error: profileError,
  };
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { data } = await getSession();
  return !!data.session;
}

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(callback: (session: any) => void) {
  return onAuthStateChange((event, session) => {
    callback(session);
  });
}

// ============================================
// Authentication
// ============================================

/**
 * Sign up a new user
 */
export async function signup(email: string, password: string, options?: { fullName?: string; avatarUrl?: string }) {
  const { data, error } = await signUp(email, password, {
    data: {
      full_name: options?.fullName,
      avatar_url: options?.avatarUrl,
    },
  });

  if (error) {
    throw new Error(`Failed to sign up: ${error.message}`);
  }

  return data;
}

/**
 * Sign in with email and password
 */
export async function login(email: string, password: string) {
  const { data, error } = await signIn(email, password);

  if (error) {
    throw new Error(`Failed to sign in: ${error.message}`);
  }

  return data;
}

/**
 * Sign out current user
 */
export async function logout() {
  const { error } = await signOut();

  if (error) {
    throw new Error(`Failed to sign out: ${error.message}`);
  }
}

// ============================================
// OAuth Login
// ============================================

/**
 * Sign in with OAuth provider (e.g., Authelia SSO, Google, etc.)
 */
export async function loginWithOAuth(provider: 'google' | 'github' | 'azure' | 'apple' | 'authelia') {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    throw new Error(`Failed to sign in with ${provider}: ${error.message}`);
  }

  return data;
}

/**
 * Handle OAuth callback
 */
export async function handleOAuthCallback() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(`Failed to handle OAuth callback: ${error.message}`);
  }

  return data;
}

// ============================================
// Password Management
// ============================================

/**
 * Send password reset email
 */
export async function resetPassword(email: string) {
  const { error } = await resetPasswordAuth(email);

  if (error) {
    throw new Error(`Failed to send reset email: ${error.message}`);
  }
}

/**
 * Update user password
 */
export async function changePassword(newPassword: string) {
  const { error } = await updatePasswordAuth(newPassword);

  if (error) {
    throw new Error(`Failed to update password: ${error.message}`);
  }
}

// ============================================
// Profile Management
// ============================================

/**
 * Get user profile
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Profile doesn't exist
    }
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }

  return data;
}

/**
 * Update user profile
 */
export async function updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }

  return data;
}

/**
 * Update user full name
 */
export async function updateFullName(userId: string, fullName: string): Promise<Profile> {
  return updateProfile(userId, { full_name: fullName });
}

/**
 * Update user avatar
 */
export async function updateAvatar(userId: string, avatarUrl: string): Promise<Profile> {
  return updateProfile(userId, { avatar_url: avatarUrl });
}

/**
 * Upload user avatar
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `avatar-${userId}.${fileExt}`;
  const filePath = `avatars/${userId}/${fileName}`;

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from('user-avatars')
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    throw new Error(`Failed to upload avatar: ${uploadError.message}`);
  }

  // Get public URL
  const { data } = supabase.storage
    .from('user-avatars')
    .getPublicUrl(filePath);

  // Update profile with new avatar URL
  await updateAvatar(userId, data.publicUrl);

  return data.publicUrl;
}

// ============================================
// User Management (Admin Only)
// ============================================

/**
 * Get all users (admin only)
 */
export async function getAllUsers(page = 1, perPage = 20) {
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, error, count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }

  return { users: data || [], total: count || 0, page, perPage };
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(userId: string, role: 'Admin' | 'Manager' | 'Member'): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update user role: ${error.message}`);
  }

  return data;
}

/**
 * Delete user (admin only)
 */
export async function deleteUser(userId: string): Promise<void> {
  // Delete profile
  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (profileError) {
    throw new Error(`Failed to delete user profile: ${profileError.message}`);
  }

  // Delete user from auth (requires admin privileges, needs edge function)
  // This should be handled by an edge function due to security restrictions
}

// ============================================
// Role-based Access Control
// ============================================

/**
 * Check if user has admin role
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const profile = await getProfile(userId);
  return profile?.role === 'Admin';
}

/**
 * Check if user has manager or admin role
 */
export async function isManager(userId: string): Promise<boolean> {
  const profile = await getProfile(userId);
  return profile?.role === 'Admin' || profile?.role === 'Manager';
}

/**
 * Check if current user has admin role
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const { data } = await getCurrentUser();
  if (!data?.user) return false;
  return isAdmin(data.user.id);
}

/**
 * Check if current user has manager or admin role
 */
export async function isCurrentUserManager(): Promise<boolean> {
  const { data } = await getCurrentUser();
  if (!data?.user) return false;
  return isManager(data.user.id);
}

// ============================================
// Utility Functions
// ============================================

/**
 * Get user initials from full name
 */
export function getUserInitials(fullName: string | null | undefined): string {
  if (!fullName) return 'U';
  return fullName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Format user display name
 */
export function formatUserDisplayName(profile: Profile | null): string {
  if (profile?.full_name) return profile.full_name;
  if (profile?.email) return profile.email;
  return 'Unknown User';
}

// ============================================
// Session Utilities
// ============================================

/**
 * Set up auth persistence
 */
export function setupAuth() {
  // Check for existing session on mount
  const initializeAuth = async () => {
    const { data } = await getSession();
    return data.session;
  };

  return initializeAuth();
}

/**
 * Refresh session
 */
export async function refreshSession() {
  const { data, error } = await supabase.auth.refreshSession();

  if (error) {
    throw new Error(`Failed to refresh session: ${error.message}`);
  }

  return data;
}

// ============================================
// Email Verification
// ============================================

/**
 * Resend verification email
 */
export async function resendVerificationEmail() {
  const { error } = await supabase.auth.resend({
    type: 'signup',
  });

  if (error) {
    throw new Error(`Failed to resend verification email: ${error.message}`);
  }
}

/**
 * Check if email is verified
 */
export async function isEmailVerified(): Promise<boolean> {
  const { data } = await getCurrentUser();
  return !!data?.user?.email_confirmed_at;
}

// Export all functions
export default {
  // Session
  getSession,
  getCurrentUserWithProfile,
  isAuthenticated,
  onAuthChange,
  // Auth
  signup,
  login,
  logout,
  loginWithOAuth,
  handleOAuthCallback,
  // Password
  resetPassword,
  changePassword,
  // Profile
  getProfile,
  updateProfile,
  updateFullName,
  updateAvatar,
  uploadAvatar,
  // User Management
  getAllUsers,
  updateUserRole,
  deleteUser,
  // Role-based Access
  isAdmin,
  isManager,
  isCurrentUserAdmin,
  isCurrentUserManager,
  // Utilities
  getUserInitials,
  formatUserDisplayName,
  // Session Utils
  setupAuth,
  refreshSession,
  // Email Verification
  resendVerificationEmail,
  isEmailVerified,
};