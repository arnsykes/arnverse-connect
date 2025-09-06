import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import type { User as SupabaseUser } from '@supabase/supabase-js';

// Extended user interface for backward compatibility
interface ExtendedUser extends SupabaseUser {
  username?: string;
  display_name?: string;
  bio?: string;
  avatar?: string;
  is_verified?: boolean;
}

// ===================================================================
// useAuth Hook - Interface ke Auth Store dengan Supabase
// ===================================================================

export function useAuth() {
  const {
    user,
    session,
    profile,
    status,
    login: loginAction,
    register: registerAction,
    logout: logoutAction,
    initialize,
  } = useAuthStore();

  // Auto-initialize Supabase auth listener saat hook pertama kali digunakan
  useEffect(() => {
    if (status === 'idle') {
      initialize();
    }
  }, [status, initialize]);

  // Computed values
  const isAuthenticated = status === 'authenticated' && !!user;
  const isLoading = status === 'loading';
  const isGuest = status === 'guest';

  // Wrapper functions untuk compatibility dengan komponen yang ada
  const login = async (credentials: { email: string; password: string }) => {
    return await loginAction(credentials.email, credentials.password);
  };

  const register = async (userData: { 
    username?: string; 
    email: string; 
    password: string; 
  }) => {
    return await registerAction(userData.email, userData.password, userData.username);
  };

  const logout = async () => {
    await logoutAction();
  };

  // Create a merged user object for backward compatibility with any type
  const mergedUser = user && profile ? {
    ...user,
    username: profile.username,
    display_name: profile.display_name,
    bio: profile.bio || undefined,
    avatar: profile.avatar_url || undefined,
    is_verified: profile.is_verified || false
  } : (user as any);

  return {
    // State - use merged user for backward compatibility
    user: mergedUser,
    session,
    profile,
    isAuthenticated,
    isLoading,
    isGuest,
    status,
    
    // Actions
    login,
    register,
    logout,
    
    // Legacy compatibility (untuk komponen yang masih pakai ini)
    loginError: null,
    registerError: null,
    isLoginPending: isLoading,
    isRegisterPending: isLoading,
  };
}