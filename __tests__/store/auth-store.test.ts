import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from '@/store/auth-store';

vi.mock('@/lib/api', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
}));

import { authApi } from '@/lib/api';

const mockLogin = vi.mocked(authApi.login);
const mockRegister = vi.mocked(authApi.register);
const mockLogout = vi.mocked(authApi.logout);

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({
    user: null,
    token: null,
    refreshToken: null,
    expiresAt: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    needsEmailConfirmation: false,
  });
  document.cookie = 'auth-token=; path=/; max-age=0';
  document.cookie = 'auth-role=; path=/; max-age=0';
});

describe('useAuthStore', () => {
  describe('login', () => {
    it('should login successfully', async () => {
      mockLogin.mockResolvedValue({
        user: { id: '1', name: 'John', role: 'buyer' },
        token: 'abc',
        refreshToken: 'def',
        expiresAt: 123,
      } as any);
      await useAuthStore.getState().login('john@test.com', '123');
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().user?.name).toBe('John');
      expect(useAuthStore.getState().token).toBe('abc');
      expect(document.cookie).toContain('auth-token=abc');
      expect(document.cookie).toContain('auth-role=buyer');
    });

    it('should set error on failure', async () => {
      mockLogin.mockRejectedValue(new Error('Invalid credentials'));
      await expect(
        useAuthStore.getState().login('john@test.com', 'wrong')
      ).rejects.toThrow();
      expect(useAuthStore.getState().error).toBe('Invalid credentials');
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it('should handle email not confirmed error', async () => {
      mockLogin.mockRejectedValue(new Error('Email not confirmed'));
      await expect(
        useAuthStore.getState().login('john@test.com', '123')
      ).rejects.toThrow();
      expect(useAuthStore.getState().error).toContain('confirmar tu correo');
    });

    it('should handle non-Error thrown value', async () => {
      mockLogin.mockRejectedValue('string error');
      await expect(
        useAuthStore.getState().login('john@test.com', '123')
      ).rejects.toBe('string error');
      expect(useAuthStore.getState().error).toBe('Ocurrió un error inesperado. Intenta de nuevo.');
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      mockRegister.mockResolvedValue({
        user: { id: '1', name: 'John', role: 'buyer' },
        token: 'abc',
        refreshToken: 'def',
      } as any);
      const result = await useAuthStore.getState().register('John', 'john@test.com', '123', 'buyer');
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(result.user).toBeDefined();
    });

    it('should handle needsEmailConfirmation', async () => {
      mockRegister.mockResolvedValue({
        needsEmailConfirmation: true,
        message: 'Check your email',
      } as any);
      const result = await useAuthStore.getState().register('John', 'john@test.com', '123', 'buyer');
      expect(useAuthStore.getState().needsEmailConfirmation).toBe(true);
      expect(result.needsEmailConfirmation).toBe(true);
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it('should set error on failure', async () => {
      mockRegister.mockRejectedValue(new Error('Email taken'));
      await expect(
        useAuthStore.getState().register('John', 'taken@test.com', '123', 'buyer')
      ).rejects.toThrow();
      expect(useAuthStore.getState().error).toBe('Email taken');
    });

    it('should handle non-Error thrown value', async () => {
      mockRegister.mockRejectedValue('string error');
      await expect(
        useAuthStore.getState().register('John', 'john@test.com', '123', 'buyer')
      ).rejects.toBe('string error');
      expect(useAuthStore.getState().error).toBe('Ocurrió un error inesperado. Intenta de nuevo.');
    });
  });

  describe('logout', () => {
    it('should logout and clear state', async () => {
      useAuthStore.setState({
        user: { id: '1', name: 'John', role: 'buyer' } as any,
        token: 'abc',
        isAuthenticated: true,
      });
      document.cookie = 'auth-token=abc; path=/';
      document.cookie = 'auth-role=buyer; path=/';
      mockLogout.mockResolvedValue(undefined as any);
      await useAuthStore.getState().logout();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().token).toBeNull();
    });

    it('should logout even if API call fails', async () => {
      useAuthStore.setState({
        user: { id: '1', name: 'John', role: 'buyer' } as any,
        token: 'abc',
        isAuthenticated: true,
      });
      mockLogout.mockRejectedValue(new Error('fail'));
      await useAuthStore.getState().logout();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      useAuthStore.setState({ error: 'Some error' });
      useAuthStore.getState().clearError();
      expect(useAuthStore.getState().error).toBeNull();
    });
  });

  describe('clearEmailConfirmation', () => {
    it('should clear email confirmation state', () => {
      useAuthStore.setState({ needsEmailConfirmation: true });
      useAuthStore.getState().clearEmailConfirmation();
      expect(useAuthStore.getState().needsEmailConfirmation).toBe(false);
    });
  });

  describe('setUser', () => {
    it('should set user', () => {
      useAuthStore.getState().setUser({ id: '1', name: 'John', role: 'buyer' } as any);
      expect(useAuthStore.getState().user?.name).toBe('John');
    });
  });
});
