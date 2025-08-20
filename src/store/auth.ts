// ===================================================================
// ARNVERSE Auth Store - Manajemen state authentication
// Menggunakan Zustand untuk state management yang sederhana
// ===================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

// Type definitions
interface User {
  id: number;
  username: string;
  display_name: string;
  email: string;
  bio?: string;
  avatar?: string;
  is_verified?: boolean;
  is_admin?: boolean;
  created_at?: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  status: 'idle' | 'loading' | 'authenticated' | 'guest';
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hydrate: () => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}

// ===================================================================
// Zustand Store dengan persistence
// ===================================================================
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      status: 'idle',

      // ===================================================================
      // LOGIN: Email + Password → Token + User
      // ===================================================================
      login: async (email: string, password: string) => {
        set({ status: 'loading' });
        
        try {
          const response = await authApi.login({ email, password });
          
          if (response.ok && response.data) {
            const authData = response.data as AuthResponse;
            const { token, user } = authData;
            
            // Ensure user data has safe defaults
            const safeUser = {
              id: user?.id || 0,
              username: user?.username || '',
              email: user?.email || '',
              display_name: user?.display_name || 'Unknown User',
              bio: user?.bio || null,
              avatar: user?.avatar || null,
              is_verified: Boolean(user?.is_verified),
              is_admin: Boolean(user?.is_admin),
              created_at: user?.created_at || new Date().toISOString(),
            };
            
            // Save token dan user
            set({ 
              token, 
              user: safeUser, 
              status: 'authenticated' 
            });
            
            // Save token ke localStorage juga (untuk compatibility)
            localStorage.setItem('arn_token', token);
            
            toast({
              title: "Selamat datang!",
              description: `Halo ${safeUser.display_name || safeUser.username}! Selamat datang di ARNVERSE`,
            });
            
            return true;
          } else {
            throw new Error(response.error || 'Login gagal');
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Network error';
          
          set({ status: 'guest' });
          
          toast({
            title: "Login gagal",
            description: errorMsg,
            variant: "destructive",
          });
          
          return false;
        }
      },

      // ===================================================================
      // REGISTER: Username + Email + Password → Auto Login
      // ===================================================================
      register: async (username: string, email: string, password: string) => {
        set({ status: 'loading' });
        
        try {
          const response = await authApi.register({ username, email, password });
          
          if (response.ok && response.data) {
            const authData = response.data as AuthResponse;
            const { token, user } = authData;
            
            // Auto login setelah register
            set({ 
              token, 
              user, 
              status: 'authenticated' 
            });
            
            localStorage.setItem('arn_token', token);
            
            toast({
              title: "Akun berhasil dibuat!",
              description: `Selamat datang di ARNVERSE, ${user.display_name || user.username}!`,
            });
            
            return true;
          } else {
            throw new Error(response.error || 'Registrasi gagal');
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Network error';
          
          set({ status: 'guest' });
          
          toast({
            title: "Registrasi gagal",
            description: errorMsg,
            variant: "destructive",
          });
          
          return false;
        }
      },

      // ===================================================================
      // LOGOUT: Hapus token dan user
      // ===================================================================
      logout: () => {
        // Hapus dari state
        set({ 
          user: null, 
          token: null, 
          status: 'guest' 
        });
        
        // Hapus dari localStorage
        localStorage.removeItem('arn_token');
        
        // Call API logout (opsional, tidak perlu await)
        authApi.logout().catch(() => {
          // Ignore error, kita sudah clear client state
        });
        
        toast({
          title: "Logout berhasil",
          description: "Sampai jumpa lagi di ARNVERSE!",
        });
      },

      // ===================================================================
      // HYDRATE: Restore session dari localStorage saat app load
      // ===================================================================
      hydrate: async () => {
        const currentToken = get().token || localStorage.getItem('arn_token');
        
        if (!currentToken) {
          set({ status: 'guest' });
          return;
        }
        
        set({ status: 'loading', token: currentToken });
        
        try {
          const response = await authApi.me();
          
          if (response.ok && response.data && typeof response.data === 'object' && 'user' in response.data) {
            const userData = (response.data as { user: User }).user;
            
            // Ensure user data has safe defaults
            const safeUser = {
              id: userData?.id || 0,
              username: userData?.username || '',
              email: userData?.email || '',
              display_name: userData?.display_name || 'Unknown User',
              bio: userData?.bio || null,
              avatar: userData?.avatar || null,
              is_verified: Boolean(userData?.is_verified),
              is_admin: Boolean(userData?.is_admin),
              created_at: userData?.created_at || new Date().toISOString(),
            };
            
            set({ 
              user: safeUser, 
              token: currentToken,
              status: 'authenticated' 
            });
          } else {
            // Token invalid, clear state
            set({ 
              user: null, 
              token: null, 
              status: 'guest' 
            });
            localStorage.removeItem('arn_token');
          }
        } catch (error) {
          // Network error atau token invalid
          set({ 
            user: null, 
            token: null, 
            status: 'guest' 
          });
          localStorage.removeItem('arn_token');
        }
      },

      // ===================================================================
      // Utility setters
      // ===================================================================
      setUser: (user: User | null) => set({ user }),
      setToken: (token: string | null) => set({ token }),
    }),
    {
      name: 'arnverse-auth', // localStorage key
      // Hanya persist token, user akan di-fetch ulang via hydrate
      partialize: (state) => ({ 
        token: state.token 
      }),
    }
  )
);