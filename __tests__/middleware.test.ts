import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// We need to test the middleware logic. Since middleware.ts exports a function
// that uses NextRequest/NextResponse, we mock the module to extract pure logic.

// Test the pure helper functions by re-implementing them as they are in middleware.ts
const publicRoutes = ['/', '/login', '/register', '/products', '/stores', '/api/health'];
const sellerRoutes = ['/dashboard', '/dashboard/new-store', '/dashboard/my-store'];
const adminRoutes = ['/admin'];

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => {
    if (route === '/') return pathname === '/';
    return pathname === route || pathname.startsWith(route + '/');
  });
}

function matchPath(pathname: string, patterns: string[]): boolean {
  return patterns.some((pattern) => pathname === pattern || pathname.startsWith(pattern + '/'));
}

describe('isPublicRoute', () => {
  it('should match exact public routes', () => {
    expect(isPublicRoute('/')).toBe(true);
    expect(isPublicRoute('/login')).toBe(true);
    expect(isPublicRoute('/register')).toBe(true);
    expect(isPublicRoute('/products')).toBe(true);
    expect(isPublicRoute('/stores')).toBe(true);
    expect(isPublicRoute('/api/health')).toBe(true);
  });

  it('should match nested public routes', () => {
    expect(isPublicRoute('/products/abc')).toBe(true);
    expect(isPublicRoute('/stores/my-store')).toBe(true);
    expect(isPublicRoute('/login/extra')).toBe(true);
  });

  it('should not match non-public routes', () => {
    expect(isPublicRoute('/dashboard')).toBe(false);
    expect(isPublicRoute('/admin')).toBe(false);
    expect(isPublicRoute('/profile')).toBe(false);
    expect(isPublicRoute('/wishlist')).toBe(false);
  });

  it('should not match partial route names', () => {
    expect(isPublicRoute('/productss')).toBe(false);
    expect(isPublicRoute('/store')).toBe(false);
  });
});

describe('matchPath', () => {
  it('should match exact paths', () => {
    expect(matchPath('/dashboard', ['/dashboard'])).toBe(true);
    expect(matchPath('/admin', ['/admin'])).toBe(true);
  });

  it('should match nested paths', () => {
    expect(matchPath('/dashboard/new-store', ['/dashboard'])).toBe(true);
    expect(matchPath('/admin/categories', ['/admin'])).toBe(true);
    expect(matchPath('/dashboard/my-store/abc/edit', ['/dashboard/my-store'])).toBe(true);
  });

  it('should not match unrelated paths', () => {
    expect(matchPath('/products', ['/dashboard'])).toBe(false);
    expect(matchPath('/profile', ['/admin'])).toBe(false);
  });

  it('should match against multiple patterns', () => {
    expect(matchPath('/admin', sellerRoutes)).toBe(false);
    expect(matchPath('/dashboard', sellerRoutes)).toBe(true);
    expect(matchPath('/admin', adminRoutes)).toBe(true);
  });
});

describe('middleware integration', () => {
  const fetchMock = vi.fn();

  function createRequest(pathname: string, cookies?: Record<string, string>) {
    const url = new URL(pathname, 'http://localhost:4000');
    const req = new NextRequest(url);
    if (cookies) {
      for (const [key, value] of Object.entries(cookies)) {
        req.cookies.set(key, value);
      }
    }
    return req;
  }

  beforeEach(() => {
    vi.stubEnv('INTERNAL_API_ORIGIN', 'https://backend.test');
    vi.stubEnv('NEXT_PUBLIC_API_URL', '');
    vi.stubGlobal('fetch', fetchMock);
  });

  it('should allow public routes without auth', async () => {
    const { middleware } = await import('@/middleware');
    const res = await middleware(createRequest('/products'));
    expect(res.status).not.toBe(307);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('should redirect unauthenticated users to login', async () => {
    const { middleware } = await import('@/middleware');
    const res = await middleware(createRequest('/dashboard'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/login');
    expect(res.headers.get('location')).toContain('callbackUrl');
  });

  it('should verify the session token against the backend', async () => {
    const { middleware } = await import('@/middleware');
    // Forged token: backend rejects it -> treated as no session, fail-closed
    fetchMock.mockResolvedValueOnce(new Response('unauthorized', { status: 401 }));
    const res = await middleware(createRequest('/dashboard', {
      'auth-token': 'forged-token',
      'auth-role': 'seller',
    }));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain('/api/v1/users/profile');
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/login');
    expect(res.headers.get('location')).toContain('callbackUrl=%2Fdashboard');
  });

  it('should allow authenticated sellers to dashboard', async () => {
    const { middleware } = await import('@/middleware');
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ role: 'Seller' }), { status: 200 })
    );
    const res = await middleware(createRequest('/dashboard', { 'auth-token': 'valid' }));
    expect(res.status).not.toBe(307);
  });

  it('should send non-admins to /forbidden (explained), home', async () => {
    const { middleware } = await import('@/middleware');
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ role: 'seller' }), { status: 200 })
    );
    const res = await middleware(createRequest('/admin', { 'auth-token': 'valid' }));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('localhost:4000/forbidden');
  });

  it('should allow admin to admin routes', async () => {
    const { middleware } = await import('@/middleware');
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ role: 'admin' }), { status: 200 })
    );
    const res = await middleware(createRequest('/admin', { 'auth-token': 'valid' }));
    expect(res.status).not.toBe(307);
  });

  it('should send buyers away from dashboard to /forbidden', async () => {
    const { middleware } = await import('@/middleware');
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ role: 'buyer' }), { status: 200 })
    );
    const res = await middleware(createRequest('/dashboard', { 'auth-token': 'valid' }));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/forbidden');
  });

  it('should let unknown routes through so they reach the 404 page', async () => {
    const { middleware } = await import('@/middleware');
    const res = await middleware(createRequest('/ruta-inexistente'));
    expect(res.status).not.toBe(307);
    const location = res.headers.get('location');
    expect(location ?? '').not.toContain('/login');
  });

  it('should redirect unauthenticated users from profile to login', async () => {
    const { middleware } = await import('@/middleware');
    const res = await middleware(createRequest('/profile'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/login');
    expect(res.headers.get('location')).toContain('callbackUrl=%2Fprofile');
  });

  it('should fail closed when the backend is unreachable', async () => {
    const { middleware } = await import('@/middleware');
    fetchMock.mockRejectedValueOnce(new Error('boom'));
    const res = await middleware(createRequest('/profile', { 'auth-token': 'valid' }));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/login');
  });
});

describe('config', () => {
  it('should have a matcher that excludes static files', async () => {
    const { config } = await import('@/middleware');
    expect(config.matcher).toBeDefined();
    expect(config.matcher.length).toBeGreaterThan(0);
    expect(config.matcher[0]).toContain('_next/static');
    expect(config.matcher[0]).toContain('favicon.ico');
  });
});
