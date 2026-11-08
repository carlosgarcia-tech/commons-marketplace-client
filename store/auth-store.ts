import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { authApi } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api/error-message';
import { setAuthCookies, clearAuthCookies } from '@/lib/auth-cookies';

interface RegisterResponse {
  needsEmailConfirmation?: boolean;
  message?: string;
  user?: User;
  token?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  needsEmailConfirmation: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<RegisterResponse>;
  logout: () => void;
  clearError: () => void;
  clearEmailConfirmation: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      expiresAt: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      needsEmailConfirmation: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login({ email, password });
          set({
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            expiresAt: response.expiresAt || null,
            isAuthenticated: true,
            isLoading: false,
          });
          if (response.token && response.user) {
            setAuthCookies(response.token, response.user.role);
          }
        } catch (error: unknown) {
          const errorMessage = getApiErrorMessage(error);
          
          if (errorMessage.toLowerCase().includes('email not confirmed')) {
            set({
              isLoading: false,
              error: 'Debes confirmar tu correo electrónico antes de iniciar sesión. Por favor, revisa tu inbox.',
            });
          } else {
            set({
              isLoading: false,
              error: errorMessage,
            });
          }
          throw error;
        }
      },

      register: async (name: string, email: string, password: string, role: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register({ name, email, password, role });
          
          if (response.needsEmailConfirmation) {
            set({
              isLoading: false,
              needsEmailConfirmation: true,
            });
            return { needsEmailConfirmation: true, message: response.message };
          }
          
          set({
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            expiresAt: response.expiresAt || null,
            isAuthenticated: true,
            isLoading: false,
          });
          
          if (response.token && response.user) {
            setAuthCookies(response.token, response.user.role);
          }
          
          return { user: response.user, token: response.token };
        } catch (error) {
          set({
            isLoading: false,
            error: getApiErrorMessage(error),
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // Ignore logout errors, proceed with local logout
        }
        
        clearAuthCookies();
        
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-storage');
        }
        
        set({
          user: null,
          token: null,
          refreshToken: null,
          expiresAt: null,
          isAuthenticated: false,
          error: null,
          needsEmailConfirmation: false,
        });
      },

      clearError: () => set({ error: null }),

      clearEmailConfirmation: () => set({ needsEmailConfirmation: false }),

      setUser: (user: User) => set({ user }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);