import { describe, it, expect, vi, beforeEach } from 'vitest';
import { API_ENDPOINTS, API_URL } from '@/lib/api/endpoints';

vi.mock('axios', () => {
  const mockAxiosInstance = Object.assign(
    vi.fn().mockResolvedValue({ data: {} }),
    {
      get: vi.fn().mockResolvedValue({ data: {} }),
      post: vi.fn().mockResolvedValue({ data: {} }),
      put: vi.fn().mockResolvedValue({ data: {} }),
      patch: vi.fn().mockResolvedValue({ data: {} }),
      delete: vi.fn().mockResolvedValue({ data: {} }),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    }
  );
  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
    __mockInstance: mockAxiosInstance,
  };
});

vi.mock('@/lib/sanitize', () => ({
  sanitizeFormData: vi.fn((data) => data),
}));

describe('API_URL', () => {
  it('should default to empty string', () => {
    expect(API_URL).toBe(process.env.NEXT_PUBLIC_API_URL || '');
  });
});

describe('API_ENDPOINTS', () => {
  describe('auth', () => {
    it('should have all auth endpoints', () => {
      expect(API_ENDPOINTS.auth.register).toBe('/api/v1/auth/register');
      expect(API_ENDPOINTS.auth.login).toBe('/api/v1/auth/login');
      expect(API_ENDPOINTS.auth.logout).toBe('/api/v1/auth/logout');
      expect(API_ENDPOINTS.auth.refresh).toBe('/api/v1/auth/refresh');
    });
  });

  describe('users', () => {
    it('should have list and me endpoints', () => {
      expect(API_ENDPOINTS.users.list).toBe('/api/v1/users');
      expect(API_ENDPOINTS.users.me).toBe('/api/v1/users/me');
    });

    it('should generate correct URL for user id', () => {
      expect(API_ENDPOINTS.users.get('abc123')).toBe('/api/v1/users/abc123');
      expect(API_ENDPOINTS.users.update('abc123')).toBe('/api/v1/users/abc123');
    });
  });

  describe('categories', () => {
    it('should have all category endpoints', () => {
      expect(API_ENDPOINTS.categories.list).toBe('/api/v1/categories');
      expect(API_ENDPOINTS.categories.create).toBe('/api/v1/categories');
    });

    it('should generate correct URL for category id', () => {
      expect(API_ENDPOINTS.categories.get('cat1')).toBe('/api/v1/categories/cat1');
      expect(API_ENDPOINTS.categories.update('cat1')).toBe('/api/v1/categories/cat1');
      expect(API_ENDPOINTS.categories.delete('cat1')).toBe('/api/v1/categories/cat1');
    });
  });

  describe('stores', () => {
    it('should have all store endpoints', () => {
      expect(API_ENDPOINTS.stores.list).toBe('/api/v1/stores');
      expect(API_ENDPOINTS.stores.me).toBe('/api/v1/stores/me');
      expect(API_ENDPOINTS.stores.create).toBe('/api/v1/stores');
      expect(API_ENDPOINTS.stores.pending).toBe('/api/v1/stores/admin/pending');
    });

    it('should generate correct URL for store id', () => {
      expect(API_ENDPOINTS.stores.get('store1')).toBe('/api/v1/stores/store1');
      expect(API_ENDPOINTS.stores.update('store1')).toBe('/api/v1/stores/store1');
      expect(API_ENDPOINTS.stores.delete('store1')).toBe('/api/v1/stores/store1');
      expect(API_ENDPOINTS.stores.updateStatus('store1')).toBe('/api/v1/stores/admin/store1/status');
    });
  });

  describe('products', () => {
    it('should have all product endpoints', () => {
      expect(API_ENDPOINTS.products.list).toBe('/api/v1/products');
      expect(API_ENDPOINTS.products.create).toBe('/api/v1/products');
    });

    it('should generate correct URL for product id', () => {
      expect(API_ENDPOINTS.products.get('prod1')).toBe('/api/v1/products/prod1');
      expect(API_ENDPOINTS.products.update('prod1')).toBe('/api/v1/products/prod1');
      expect(API_ENDPOINTS.products.delete('prod1')).toBe('/api/v1/products/prod1');
      expect(API_ENDPOINTS.products.byStore('store1')).toBe('/api/v1/products/store/store1');
    });
  });

  describe('reviews', () => {
    it('should have all review endpoints', () => {
      expect(API_ENDPOINTS.reviews.list).toBe('/api/v1/reviews');
      expect(API_ENDPOINTS.reviews.create).toBe('/api/v1/reviews');
    });

    it('should generate correct URL for review id', () => {
      expect(API_ENDPOINTS.reviews.get('rev1')).toBe('/api/v1/reviews/rev1');
      expect(API_ENDPOINTS.reviews.update('rev1')).toBe('/api/v1/reviews/rev1');
      expect(API_ENDPOINTS.reviews.delete('rev1')).toBe('/api/v1/reviews/rev1');
    });
  });

  describe('chat', () => {
    it('should have chat endpoints', () => {
      expect(API_ENDPOINTS.chat.token).toBe('/api/v1/chat/token');
      expect(API_ENDPOINTS.chat.conversations).toBe('/api/v1/chat/conversations');
      expect(API_ENDPOINTS.chat.sendMessage).toBe('/api/v1/chat/messages');
    });

    it('should generate correct URL for chat messages', () => {
      expect(API_ENDPOINTS.chat.messages('conv1')).toBe('/api/v1/chat/conversations/conv1/messages');
      expect(API_ENDPOINTS.chat.getOrCreateConversation('user1')).toBe('/api/v1/chat/conversations/user/user1');
    });
  });

  describe('wishlist', () => {
    it('should have wishlist endpoints', () => {
      expect(API_ENDPOINTS.wishlist.list).toBe('/api/v1/wishlist');
      expect(API_ENDPOINTS.wishlist.add).toBe('/api/v1/wishlist');
      expect(API_ENDPOINTS.wishlist.clear).toBe('/api/v1/wishlist');
    });

    it('should generate correct URL for wishlist operations', () => {
      expect(API_ENDPOINTS.wishlist.remove('prod1')).toBe('/api/v1/wishlist/prod1');
      expect(API_ENDPOINTS.wishlist.check('prod1')).toBe('/api/v1/wishlist/check/prod1');
    });
  });

  describe('sellerRequests', () => {
    it('should have seller request endpoints', () => {
      expect(API_ENDPOINTS.sellerRequests.list).toBe('/api/v1/seller-requests');
      expect(API_ENDPOINTS.sellerRequests.create).toBe('/api/v1/seller-requests');
    });

    it('should generate correct URL for status update', () => {
      expect(API_ENDPOINTS.sellerRequests.updateStatus('req1')).toBe('/api/v1/seller-requests/req1/status');
    });
  });

  describe('admin', () => {
    it('should have admin endpoints', () => {
      expect(API_ENDPOINTS.admin.stats).toBe('/api/v1/admin/stats');
    });

    it('should generate correct URL for admin product delete', () => {
      expect(API_ENDPOINTS.admin.products.delete('prod1')).toBe('/api/v1/admin/products/prod1');
    });
  });
});

describe('ApiClient', () => {
  let apiClient: any;
  let mockInstance: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    const axiosMock = await import('axios') as any;
    mockInstance = axiosMock.__mockInstance;
    const clientModule = await import('@/lib/api/client');
    apiClient = clientModule.apiClient;
  });

  describe('HTTP methods', () => {
    it('get should call client.get and return data', async () => {
      mockInstance.get.mockResolvedValueOnce({ data: { id: 1 } });
      const result = await apiClient.get('/test');
      expect(mockInstance.get).toHaveBeenCalledWith('/test', { params: undefined });
      expect(result).toEqual({ id: 1 });
    });

    it('get should pass params', async () => {
      mockInstance.get.mockResolvedValueOnce({ data: { items: [] } });
      await apiClient.get('/test', { page: 1, limit: 10 });
      expect(mockInstance.get).toHaveBeenCalledWith('/test', { params: { page: 1, limit: 10 } });
    });

    it('post should call client.post and return data', async () => {
      mockInstance.post.mockResolvedValueOnce({ data: { id: 1 } });
      const result = await apiClient.post('/test', { name: 'test' });
      expect(mockInstance.post).toHaveBeenCalledWith('/test', { name: 'test' }, undefined);
      expect(result).toEqual({ id: 1 });
    });

    it('put should call client.put and return data', async () => {
      mockInstance.put.mockResolvedValueOnce({ data: { id: 1 } });
      const result = await apiClient.put('/test', { name: 'updated' });
      expect(mockInstance.put).toHaveBeenCalledWith('/test', { name: 'updated' }, undefined);
      expect(result).toEqual({ id: 1 });
    });

    it('patch should call client.patch and return data', async () => {
      mockInstance.patch.mockResolvedValueOnce({ data: { id: 1 } });
      const result = await apiClient.patch('/test', { name: 'patched' });
      expect(mockInstance.patch).toHaveBeenCalledWith('/test', { name: 'patched' });
      expect(result).toEqual({ id: 1 });
    });

    it('delete should call client.delete and return data', async () => {
      mockInstance.delete.mockResolvedValueOnce({ data: { success: true } });
      const result = await apiClient.delete('/test/1');
      expect(mockInstance.delete).toHaveBeenCalledWith('/test/1');
      expect(result).toEqual({ success: true });
    });
  });

  describe('Request interceptor', () => {
    it('should add Authorization header from localStorage', () => {
      const interceptor = mockInstance.interceptors.request.use.mock.calls[0][0];
      const config = { headers: {}, data: null };
      localStorage.setItem('auth-storage', JSON.stringify({ state: { token: 'my-token' } }));
      const result = interceptor(config);
      expect(result.headers.Authorization).toBe('Bearer my-token');
    });

    it('should not add header if no auth-storage', () => {
      const interceptor = mockInstance.interceptors.request.use.mock.calls[0][0];
      const config = { headers: {}, data: null };
      localStorage.removeItem('auth-storage');
      const result = interceptor(config);
      expect(result.headers.Authorization).toBeUndefined();
    });

    it('should not add header if parsed token is missing', () => {
      const interceptor = mockInstance.interceptors.request.use.mock.calls[0][0];
      const config = { headers: {}, data: null };
      localStorage.setItem('auth-storage', JSON.stringify({ state: {} }));
      const result = interceptor(config);
      expect(result.headers.Authorization).toBeUndefined();
    });

    it('should handle malformed JSON in localStorage', () => {
      const interceptor = mockInstance.interceptors.request.use.mock.calls[0][0];
      const config = { headers: {}, data: null };
      localStorage.setItem('auth-storage', 'not-valid-json');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = interceptor(config);
      expect(result).toEqual(config);
      consoleSpy.mockRestore();
    });

    it('should sanitize FormData', async () => {
      const interceptor = mockInstance.interceptors.request.use.mock.calls[0][0];
      const formData = new FormData();
      formData.append('name', 'test');
      const config = { headers: {}, data: formData };
      localStorage.removeItem('auth-storage');
      interceptor(config);
      const sanitize = await import('@/lib/sanitize');
      expect(sanitize.sanitizeFormData).toHaveBeenCalledWith(formData);
    });
  });

  describe('Response interceptor', () => {
    it('should pass through successful responses', () => {
      const interceptor = mockInstance.interceptors.response.use.mock.calls[0][0];
      const response = { data: { id: 1 } };
      const result = interceptor(response);
      expect(result).toBe(response);
    });

    it('should re-throw non-401 errors', async () => {
      const interceptor = mockInstance.interceptors.response.use.mock.calls[0][1];
      const error = { response: { status: 500 }, config: {} };
      await expect(interceptor(error)).rejects.toBe(error);
    });

    it('should handle 401 with successful token refresh', async () => {
      const interceptor = mockInstance.interceptors.response.use.mock.calls[0][1];
      const originalConfig = { _retry: false, headers: {} };
      const error = { response: { status: 401 }, config: originalConfig };

      localStorage.setItem('auth-storage', JSON.stringify({
        state: { refreshToken: 'refresh-123', token: 'old-token', user: { role: 'buyer' } },
      }));

      mockInstance.post.mockResolvedValueOnce({ data: { token: 'new-token', expiresAt: 999 } });
      mockInstance.mockResolvedValueOnce({ data: { id: 1 } });

      const result = await interceptor(error);
      expect(mockInstance.post).toHaveBeenCalledWith(API_ENDPOINTS.auth.refresh, { refreshToken: 'refresh-123' });
      expect(result).toEqual({ data: { id: 1 } });
    });

    it('should handle 401 with failed refresh (no refresh token)', async () => {
      const interceptor = mockInstance.interceptors.response.use.mock.calls[0][1];
      const originalConfig = { _retry: false, headers: {} };
      const error = { response: { status: 401 }, config: originalConfig };

      localStorage.setItem('auth-storage', JSON.stringify({
        state: { token: 'old-token' },
      }));

      await expect(interceptor(error)).rejects.toBe(error);
      expect(localStorage.getItem('auth-storage')).toBeNull();
    });

    it('should handle 401 when refresh call throws', async () => {
      const interceptor = mockInstance.interceptors.response.use.mock.calls[0][1];
      const originalConfig = { _retry: false, headers: {}, url: '/test' };
      const error = { response: { status: 401 }, config: originalConfig, message: '401' };

      localStorage.setItem('auth-storage', JSON.stringify({
        state: { refreshToken: 'refresh-123' },
      }));

      mockInstance.post.mockRejectedValueOnce(new Error('Network fail'));

      await expect(interceptor(error)).rejects.toBe(error);
      expect(localStorage.getItem('auth-storage')).toBeNull();
    });

    it('should queue requests while refreshing', async () => {
      const interceptor = mockInstance.interceptors.response.use.mock.calls[0][1];
      const originalConfig1 = { _retry: false, headers: {} };
      const error1 = { response: { status: 401 }, config: originalConfig1 };

      localStorage.setItem('auth-storage', JSON.stringify({
        state: { refreshToken: 'refresh-123', token: 'old' },
      }));

      mockInstance.post.mockResolvedValue({ data: { token: 'new-token', expiresAt: 999 } });
      mockInstance.mockResolvedValue({ data: { retried: true } });

      const promise1 = interceptor(error1);

      const originalConfig2 = { _retry: false, headers: {} };
      const error2 = { response: { status: 401 }, config: originalConfig2 };
      const promise2 = interceptor(error2);

      const [result1, result2] = await Promise.all([promise1, promise2]);
      expect(result1).toEqual({ data: { retried: true } });
      expect(result2).toEqual({ data: { retried: true } });
    });

    it('should reject queued requests when refresh returns null', async () => {
      const interceptor = mockInstance.interceptors.response.use.mock.calls[0][1];

      localStorage.setItem('auth-storage', JSON.stringify({
        state: { refreshToken: 'refresh-123' },
      }));

      mockInstance.post.mockResolvedValue({ data: {} });

      const originalConfig1 = { _retry: false, headers: {} };
      const error1 = { response: { status: 401 }, config: originalConfig1 };
      const promise1 = interceptor(error1);

      const originalConfig2 = { _retry: false, headers: {} };
      const error2 = { response: { status: 401 }, config: originalConfig2 };
      const promise2 = interceptor(error2);

      await expect(Promise.all([promise1, promise2])).rejects.toBe(error1);
    });
  });

  it('should not trigger session expiry for auth endpoints (login 401 is a business outcome)', async () => {
    const interceptor = mockInstance.interceptors.response.use.mock.calls[0][1];
    const error = { response: { status: 401 }, config: { url: API_ENDPOINTS.auth.login } };

    localStorage.setItem('auth-storage', JSON.stringify({ state: { token: 'kept' } }));

    await expect(interceptor(error)).rejects.toBe(error);
    // Session state must be untouched: the user may still log in correctly.
    expect(localStorage.getItem('auth-storage')).not.toBeNull();
  });

  describe('handleExpiredSession', () => {
    it('should clear storage and cookies without navigating away', async () => {
      const interceptor = mockInstance.interceptors.response.use.mock.calls[0][1];
      const originalConfig = { _retry: false, headers: {}, url: '/api/v1/wishlist' };
      const error = { response: { status: 401 }, config: originalConfig };

      localStorage.setItem('auth-storage', JSON.stringify({ state: { token: 'old' } }));
      document.cookie = 'auth-token=old; path=/';

      let expiredFired = false;
      window.addEventListener('auth:session-expired', () => { expiredFired = true; }, { once: true });

      await expect(interceptor(error)).rejects.toBe(error);
      expect(localStorage.getItem('auth-storage')).toBeNull();
      expect(document.cookie).not.toContain('auth-token=old');
      expect(expiredFired).toBe(true);
      // Stays on the page: no forced location change
      expect(window.location.pathname).toBe('/');
    });
  });
});
