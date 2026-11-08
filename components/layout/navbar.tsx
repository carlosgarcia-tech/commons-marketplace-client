'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/store/auth-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Badge } from '@/components/ui';

interface NavLink {
  href: string;
  label: string;
  requireAuth?: boolean;
  roles?: ('buyer' | 'seller' | 'admin')[];
}

const navLinks: NavLink[] = [
  { href: '/products', label: 'Productos' },
  { href: '/stores', label: 'Tiendas' },
  { href: '/wishlist', label: 'Deseos', requireAuth: true },
  { href: '/profile', label: 'Perfil', requireAuth: true },
  { href: '/dashboard', label: 'Mi Tienda', requireAuth: true, roles: ['seller', 'admin'] },
  { href: '/admin', label: 'Admin', requireAuth: true, roles: ['admin'] },
];

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { fetchWishlist } = useWishlistStore();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    }
    // fetchWishlist is a stable store action; only auth toggles it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // The API client broadcasts session expiry instead of hard-navigating;
  // sync the store so protected pages show their logged-out state in place.
  useEffect(() => {
    const handleExpired = () => {
      useAuthStore.setState({
        user: null,
        token: null,
        refreshToken: null,
        expiresAt: null,
        isAuthenticated: false,
        error: 'Tu sesión ha expirado. Vuelve a entrar.',
      });
    };
    window.addEventListener('auth:session-expired', handleExpired);
    return () => window.removeEventListener('auth:session-expired', handleExpired);
  }, []);

  const userRole = user?.role?.toLowerCase() || '';

  const filteredLinks = navLinks.filter((link) => {
    if (link.requireAuth && !isAuthenticated) return false;
    if (link.roles) {
      if (!user || !userRole) return false;
      const allowedRoles = link.roles.map(r => r.toLowerCase());
      if (!allowedRoles.includes(userRole)) return false;
    }
    return true;
  });

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    router.push('/');
  };

  return (
    <header className="sticky top-4 z-50 px-4 sm:px-6 lg:px-8">
      <nav
        aria-label="Navegación principal"
        className="glass-nav max-w-7xl mx-auto rounded-2xl"
      >
        <div className="px-4 sm:px-5">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-6 min-w-0">
              <Link href="/" className="flex items-center gap-2 group shrink-0 logo-glow rounded-xl">
                <Image
                  src="/logoCommons.png"
                  alt="Commons Marketplace"
                  width={36}
                  height={36}
                  className="h-8 w-auto"
                />
                <span className="font-semibold text-lg text-foreground hidden sm:block tracking-tight">
                  Commons
                </span>
              </Link>
              <div className="hidden md:flex items-center gap-1">
                {filteredLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-3 py-2 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-highlight)] rounded-xl hover:bg-white/[0.06] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isAuthenticated && user ? (
                <>
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="text-xs font-medium text-[var(--text-secondary)] truncate max-w-[140px]">
                      {user?.name || user?.email}
                    </span>
                    <Badge
                      variant={
                        user?.role?.toLowerCase() === 'admin'
                          ? 'warning'
                          : user?.role?.toLowerCase() === 'seller'
                          ? 'success'
                          : 'default'
                      }
                      className="text-[10px]"
                    >
                      {user?.role?.toLowerCase() || 'buyer'}
                    </Badge>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="glass-chip rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--danger)] px-3 py-1.5 transition-colors duration-200 press"
                  >
                    Salir
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-highlight)] px-3 py-2 rounded-xl transition-colors duration-200"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/register"
                    className="press bg-white/[0.12] backdrop-blur-xl border border-white/[0.12] rounded-2xl text-white text-[13px] font-semibold px-4 py-2 shadow-[0_10px_20px_-8px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.1)] hover:-translate-y-1 hover:bg-white/[0.18] transition-all duration-200"
                  >
                    Registro
                  </Link>
                </>
              )}
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Abrir menú"
                aria-expanded={menuOpen}
                className="md:hidden glass-chip press rounded-xl p-2 text-[var(--text-secondary)] hover:text-[var(--text-highlight)] transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  {menuOpen ? (
                    <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                  ) : (
                    <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile sheet */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden overflow-hidden border-t"
              style={{ borderColor: 'var(--glass-border)' }}
            >
              <div className="px-3 py-3 flex flex-col gap-1">
                {filteredLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="px-3 py-2.5 text-[14px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-highlight)] hover:bg-white/[0.06] rounded-xl transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                {isAuthenticated && user && (
                  <div className="flex items-center gap-2 px-3 pt-2 pb-1">
                    <span className="text-xs font-medium text-[var(--text-secondary)] truncate">{user?.name || user?.email}</span>
                    <Badge
                      variant={
                        user?.role?.toLowerCase() === 'admin'
                          ? 'warning'
                          : user?.role?.toLowerCase() === 'seller'
                          ? 'success'
                          : 'default'
                      }
                      className="text-[10px]"
                    >
                      {user?.role?.toLowerCase() || 'buyer'}
                    </Badge>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
