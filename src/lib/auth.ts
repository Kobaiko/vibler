import { supabase } from './supabase'

export interface User {
  id: string
  email: string
  user_metadata: {
    full_name?: string
    avatar_url?: string
  }
}

// Auth functions
export const authUtils = {
  // Sign up with email and password
  async signUp(email: string, password: string, options?: { 
    data?: { full_name?: string } 
  }) {
    return await supabase.auth.signUp({
      email,
      password,
      options
    })
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({
      email,
      password
    })
  },

  // Sign in with OAuth (Google, GitHub, etc.)
  async signInWithOAuth(provider: 'google' | 'github' | 'discord') {
    return await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
  },

  // Send magic link
  async sendMagicLink(email: string) {
    return await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
  },

  // Sign out
  async signOut() {
    return await supabase.auth.signOut()
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Reset password
  async resetPassword(email: string) {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
  },

  // Update password
  async updatePassword(password: string) {
    return await supabase.auth.updateUser({ password })
  },

  // Update user profile
  async updateProfile(data: { full_name?: string; avatar_url?: string }) {
    return await supabase.auth.updateUser({
      data
    })
  }
}

export default authUtils 