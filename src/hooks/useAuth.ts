import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  bio?: string;
  avatar?: string;
  isExclusive: boolean;
  followers: number;
  following: number;
  posts: number;
}

export function useAuth() {
  const queryClient = useQueryClient();
  
  // Get current user
  const { 
    data: user, 
    isLoading: isLoadingUser, 
    error: userError 
  } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await authApi.me();
      if (!response.ok) {
        throw new Error(response.error || 'Failed to get user');
      }
      return response.data as User;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      if (response.ok) {
        queryClient.setQueryData(['auth', 'me'], response.data);
        toast({
          title: "Welcome back!",
          description: "Successfully logged into ARNVERSE",
        });
      } else {
        throw new Error(response.error || 'Login failed');
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (response) => {
      if (response.ok) {
        queryClient.setQueryData(['auth', 'me'], response.data);
        toast({
          title: "Welcome to ARNVERSE!",
          description: "Your account has been created successfully",
        });
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed", 
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'me'], null);
      queryClient.clear(); // Clear all cached data
      toast({
        title: "Logged out",
        description: "See you in the cosmos soon!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Auth actions
  const login = useCallback(
    (credentials: { username: string; password: string }) => {
      loginMutation.mutate(credentials);
    },
    [loginMutation]
  );

  const register = useCallback(
    (userData: { 
      username: string; 
      email: string; 
      password: string; 
      displayName: string 
    }) => {
      registerMutation.mutate(userData);
    },
    [registerMutation]
  );

  const logout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  const isAuthenticated = !!user;
  const isLoading = isLoadingUser || 
    loginMutation.isPending || 
    registerMutation.isPending || 
    logoutMutation.isPending;

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    isLoginPending: loginMutation.isPending,
    isRegisterPending: registerMutation.isPending,
  };
}