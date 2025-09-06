// ===================================================================
// ARNVERSE Auth Store - Supabase Authentication
// Menggunakan Zustand untuk state management yang sederhana
// ===================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { User, Session } from '@supabase/supabase-js';

// Type definitions using Supabase types
interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  is_verified?: boolean;
  created_at?: string;
}

interface AuthState {
  // State
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  status: 'idle' | 'loading' | 'authenticated' | 'guest';
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, username?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  initialize: () => void;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
}

// ===================================================================
// Zustand Store dengan Supabase Authentication
// ===================================================================
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      session: null,
      profile: null,
      status: 'idle',

      // ===================================================================
      // INITIALIZE: Setup Supabase auth listener
      // ===================================================================
      initialize: () => {
        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('[Auth] State change:', event, session?.user?.email);
            
            set({ session, user: session?.user ?? null });
            
            if (session?.user) {
              // Fetch or create profile
              setTimeout(async () => {
                try {
                  const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .single();
                  
                  set({ profile, status: 'authenticated' });
                } catch (error) {
                  console.error('[Auth] Error fetching profile:', error);
                  set({ status: 'authenticated' });
                }
              }, 0);
            } else {
              set({ profile: null, status: 'guest' });
            }
          }
        );

        // Check for existing session
        supabase.auth.getSession().then(({ data: { session } }) => {
          set({ session, user: session?.user ?? null });
          if (session?.user) {
            set({ status: 'authenticated' });
          } else {
            set({ status: 'guest' });
          }
        });

        // Store subscription for cleanup
        (window as any).__supabase_auth_subscription = subscription;
      },

      // ===================================================================
      // LOGIN: Email + Password dengan Supabase
      // ===================================================================
      login: async (email: string, password: string) => {
        set({ status: 'loading' });
        
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (error) throw error;
          
          if (data.user && data.session) {
            set({ 
              user: data.user,
              session: data.session,
              status: 'authenticated'
            });
            
            toast({
              title: "Selamat datang!",
              description: `Halo ${data.user.email}! Selamat datang di ARNVERSE`,
            });
            
            return true;
          }
          
          throw new Error('Login gagal');
        } catch (error: any) {
          const errorMsg = error.message || 'Login gagal';
          
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
      // REGISTER: Email + Password dengan Supabase
      // ===================================================================
      register: async (email: string, password: string, username?: string) => {
        set({ status: 'loading' });
        
        try {
          const redirectUrl = `${window.location.origin}/`;
          
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: redirectUrl,
              data: {
                username: username || email.split('@')[0],
                display_name: username || email.split('@')[0]
              }
            }
          });
          
          if (error) throw error;
          
          if (data.user) {
            // Check if email confirmation is required
            if (!data.session) {
              toast({
                title: "Registrasi berhasil!",
                description: "Silakan cek email Anda untuk konfirmasi akun.",
              });
            } else {
              toast({
                title: "Akun berhasil dibuat!",
                description: `Selamat datang di ARNVERSE!`,
              });
            }
            
            set({ status: 'guest' });
            return true;
          }
          
          throw new Error('Registrasi gagal');
        } catch (error: any) {
          const errorMsg = error.message || 'Registrasi gagal';
          
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
      // LOGOUT: Supabase logout
      // ===================================================================
      logout: async () => {
        try {
          await supabase.auth.signOut();
          
          set({ 
            user: null, 
            session: null,
            profile: null,
            status: 'guest' 
          });
          
          toast({
            title: "Logout berhasil",
            description: "Sampai jumpa lagi di ARNVERSE!",
          });
        } catch (error) {
          console.error('[Auth] Logout error:', error);
        }
      },

      // ===================================================================
      // Utility setters
      // ===================================================================
      setUser: (user: User | null) => set({ user }),
      setSession: (session: Session | null) => set({ session }),
      setProfile: (profile: Profile | null) => set({ profile }),
    }),
    {
      name: 'arnverse-auth', // localStorage key
      // Don't persist anything - let Supabase handle session persistence
      partialize: () => ({}),
    }
  )
);