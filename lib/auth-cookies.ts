/* Browser-side session cookies. They are a transport hint for middleware —
   the server (middleware) verifies the token against the backend; these
   values are never trusted on their own. */
export function setAuthCookies(token: string, role: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `auth-token=${token}; path=/; max-age=86400; SameSite=Lax`;
  document.cookie = `auth-role=${role}; path=/; max-age=86400; SameSite=Lax`;
}

export function clearAuthCookies() {
  if (typeof document === 'undefined') return;
  document.cookie = 'auth-token=; path=/; max-age=0';
  document.cookie = 'auth-role=; path=/; max-age=0';
}
