import axios, { type AxiosInstance, type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { API_URL, API_ENDPOINTS } from './endpoints';
import { sanitizeFormData } from '@/lib/sanitize';
import { setAuthCookies, clearAuthCookies } from '@/lib/auth-cookies';
import type { RefreshResponse } from '@/types/api';

/* Auth endpoints answer 401 as a business outcome (wrong password, no session,
   refresh rejected). They must never trip the session-expiry machinery. */
const AUTH_URL_PREFIXES = [
  API_ENDPOINTS.auth.login,
  API_ENDPOINTS.auth.register,
  API_ENDPOINTS.auth.logout,
  API_ENDPOINTS.auth.refresh,
];

const BASE_CONFIG = {
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
} as const;

class ApiClient {
  private client: AxiosInstance;
  /* Dedicated instance without response interceptors: the refresh call must
     not re-enter this 401 logic, or the refresh deadlocks waiting for itself. */
  private refreshClient: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: { resolve: (token: string | null) => void }[] = [];

  constructor() {
    this.client = axios.create({ baseURL: API_URL, ...BASE_CONFIG });
    this.refreshClient = axios.create({ baseURL: API_URL, ...BASE_CONFIG });

    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (config.data instanceof FormData) {
          config.data = sanitizeFormData(config.data);
        }

        if (typeof window !== 'undefined') {
          try {
            const authData = localStorage.getItem('auth-storage');
            if (authData) {
              const parsed = JSON.parse(authData);
              const token = parsed?.state?.token;
              if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
              }
            }
          } catch (e) {
            console.error('[API] Error reading token:', e);
          }
        }
        return config;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

        if (
          error.response?.status !== 401 ||
          !originalRequest ||
          originalRequest._retry ||
          this.isAuthRequest(originalRequest.url) ||
          typeof window === 'undefined'
        ) {
          return Promise.reject(error);
        }

        originalRequest._retry = true;

        // A refresh is already in flight: queue this request behind it.
        if (this.isRefreshing) {
          return this.enqueueRetry(originalRequest, error);
        }

        this.isRefreshing = true;
        try {
          const token = await this.refreshToken();

          if (token) {
            this.drainQueue(token);
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return this.client(originalRequest);
          }

          this.drainQueue(null);
          this.handleExpiredSession();
          return Promise.reject(error);
        } catch (refreshError) {
          this.drainQueue(null);
          this.handleExpiredSession();
          return Promise.reject(refreshError);
        } finally {
          this.isRefreshing = false;
        }
      }
    );
  }

  private isAuthRequest(url: string | undefined): boolean {
    return !!url && AUTH_URL_PREFIXES.some((prefix) => url.startsWith(prefix));
  }

  // Subscribers decide what to do with null (reject their own request).
  private drainQueue(token: string | null): void {
    this.refreshSubscribers.forEach((subscriber) => subscriber.resolve(token));
    this.refreshSubscribers = [];
  }

  private enqueueRetry(
    originalRequest: InternalAxiosRequestConfig,
    error: AxiosError
  ): Promise<AxiosResponse> {
    const queued = new Promise<string | null>((resolve) => {
      this.refreshSubscribers.push({ resolve });
    });
    return queued.then((token) => {
      if (!token) return Promise.reject(error);
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return this.client(originalRequest) as Promise<AxiosResponse>;
    });
  }

  private async refreshToken(): Promise<string | null> {
    try {
      const authData = localStorage.getItem('auth-storage');
      if (!authData) return null;

      const parsed = JSON.parse(authData);
      const refreshToken = parsed?.state?.refreshToken;
      if (!refreshToken) return null;

      const response = await this.refreshClient.post<RefreshResponse>(
        API_ENDPOINTS.auth.refresh,
        { refreshToken }
      );

      const newToken = response.data.token;
      if (!newToken) return null;

      const newAuthData = {
        ...parsed,
        state: {
          ...parsed.state,
          token: newToken,
          expiresAt: response.data.expiresAt,
        },
      };
      localStorage.setItem('auth-storage', JSON.stringify(newAuthData));
      setAuthCookies(newToken, parsed?.state?.user?.role || '');
      return newToken;
    } catch (error) {
      // Refresh failed for any reason (network, 401, invalid): no session.
      console.error('[API] Token refresh failed:', error);
      return null;
    }
  }

  private handleExpiredSession(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth-storage');
    clearAuthCookies();
    // Stay on the page; the app listens for this to reset the store and show
    // a "session expired" state instead of hard-navigating home.
    window.dispatchEvent(new CustomEvent('auth:session-expired'));
  }

  get<T>(url: string, params?: Record<string, unknown>) {
    return this.client.get<T>(url, { params }).then((res) => res.data);
  }

  post<T>(url: string, data?: unknown, config?: unknown) {
    return this.client.post<T>(url, data, config as InternalAxiosRequestConfig).then((res) => res.data);
  }

  put<T>(url: string, data?: unknown, config?: unknown) {
    return this.client.put<T>(url, data, config as InternalAxiosRequestConfig).then((res) => res.data);
  }

  patch<T>(url: string, data?: unknown) {
    return this.client.patch<T>(url, data).then((res) => res.data);
  }

  delete<T>(url: string) {
    return this.client.delete<T>(url).then((res) => res.data);
  }
}

export const apiClient = new ApiClient();

export { API_ENDPOINTS };
