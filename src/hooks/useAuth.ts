import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';

// ===================================================================
// useAuth Hook - Interface ke Auth Store
// Simplified hook yang menggunakan Zustand store
// ===================================================================

export function useAuth() {
  const {
    user,
    token,
    status,
    login: loginAction,
    register: registerAction,
    logout: logoutAction,
    hydrate,
  } = useAuthStore();

  // Auto-hydrate saat hook pertama kali digunakan
  useEffect(() => {
    if (status === 'idle') {
      hydrate();
    }
  }, [status, hydrate]);

  // Computed values
  const isAuthenticated = status === 'authenticated' && !!user;
  const isLoading = status === 'loading';
  const isGuest = status === 'guest';

  // Wrapper functions untuk compatibility dengan komponen yang ada
  const login = async (credentials: { email: string; password: string }) => {
    return await loginAction(credentials.email, credentials.password);
  };

  const register = async (userData: { 
    username: string; 
    email: string; 
    password: string; 
  }) => {
    return await registerAction(userData.username, userData.email, userData.password);
  };

  const logout = () => {
    logoutAction();
  };

  return {
    // State
    user,
    token,
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