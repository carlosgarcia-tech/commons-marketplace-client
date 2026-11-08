import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE = 'auth-token';

function matchPath(pathname: string, patterns: string[]): boolean {
  return patterns.some((pattern) => pathname === pattern || pathname.startsWith(pattern + '/'));
}

/* Only account-gated paths are listed here. Everything else — public pages
   AND unknown paths — passes through, so unknown paths reach Next's 404
   instead of being hijacked to /login. */
function requiredRole(pathname: string): 'admin' | 'seller' | 'any' | null {
  if (matchPath(pathname, ['/admin'])) return 'admin';
  if (matchPath(pathname, ['/dashboard'])) return 'seller';
  if (matchPath(pathname, ['/profile', '/wishlist'])) return 'any';
  return null;
}

/* Session cookies are written by plain JS, so they prove nothing on their own.
   Ask the backend to validate the token and read the role from the verified
   session. Fail-closed: any error means "no session". */
async function verifySession(token: string): Promise<string | null> {
  const base = process.env.INTERNAL_API_ORIGIN || process.env.NEXT_PUBLIC_API_URL || '';
  if (!base) return null;

  try {
    const res = await fetch(`${base}/api/v1/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;

    const body = await res.json();
    return body?.role ?? body?.data?.role ?? body?.user?.role ?? null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const required = requiredRole(pathname);
  if (!required) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const sessionRole = await verifySession(token);
  if (!sessionRole) {
    // Forged, expired or unverifiable token: back to login, not to /.
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = sessionRole.toLowerCase();
  // Role mismatches get an explanation instead of a silent toss.
  if (required === 'admin' && role !== 'admin') {
    return NextResponse.redirect(new URL('/forbidden', request.url));
  }

  if (required === 'seller' && role !== 'seller' && role !== 'admin') {
    return NextResponse.redirect(new URL('/forbidden', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
