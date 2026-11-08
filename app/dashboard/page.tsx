/* Product images come from Supabase storage hosts; next/image would need
   remotePatterns churn across buckets. */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { useAuth, useRequireRole } from '@/hooks/use-auth';
import { storeApi } from '@/lib/api';
import type { Store } from '@/types';
import { Button, Spinner } from '@/components/ui';
import Image from 'next/image';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const { hasPermission, isLoading: roleLoading } = useRequireRole(['seller', 'admin']);
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasPermission || !isAuthenticated) return;

    const fetchStores = async () => {
      setIsLoading(true);
      try {
        const data = await storeApi.getMyStores();
        setStores(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar tiendas');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStores();
  }, [hasPermission, isAuthenticated]);

  if (roleLoading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 border-2 border-danger bg-danger-bg mb-5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-danger">
            <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <h1 className="h2 text-2xl text-foreground">Acceso Denegado</h1>
        <p className="mt-2 text-sm font-mono text-gray-400 uppercase tracking-wider">
          No tienes permiso para acceder a esta página.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-10 relative">
        <div className="absolute -left-4 top-0 w-1 h-full bg-primary" />
        <div>
          <p className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-1">Panel de control</p>
          <h1 className="h1 text-3xl md:text-4xl text-foreground">
            {user?.name ? `Hola, ${user.name.split(' ')[0]}` : 'Mi Dashboard'}
          </h1>
        </div>
        {stores.length > 0 && (
          <Link href="/dashboard/new-store">
            <Button size="sm" className="font-mono uppercase text-xs gap-1.5">
              <span className="text-base leading-none">+</span>
              <span>Nueva tienda</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 px-4 py-3 border-2 border-danger bg-danger-bg text-danger font-mono text-xs uppercase tracking-wider">
          {error}
        </div>
      )}

      {/* Empty state */}
      {stores.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 bg-surface px-8 py-16 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 border-2 border-gray-200 bg-gray-50 mb-5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h2 className="font-display font-semibold text-foreground text-lg">No tienes tiendas todavía</h2>
          <p className="mt-1.5 text-sm font-mono text-gray-400 uppercase tracking-wider">
            Crea tu primera tienda para comenzar a vender
          </p>
          <Link href="/dashboard/new-store">
            <Button className="mt-6 font-mono uppercase text-xs">Crear tienda</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3 stagger-child">
          {stores.map((store, index) => (
            <div key={store._id} style={{ animationDelay: `${index * 80}ms` }} className="animate-fadeInUp">
              <StoreRow store={store} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StoreRow({ store }: { store: Store }) {
  const initials = store.storeName.charAt(0).toUpperCase();

  return (
    <div className="group flex items-center gap-5 bg-surface border-2 border-gray-200 rounded-none px-5 py-4 transition-all duration-200 hover:border-primary hover:shadow-[4px_4px_0px_-2px_var(--gray-300)]">

      {/* Logo with blur background */}
      <div className="relative w-[56px] h-[56px] overflow-hidden flex-shrink-0 bg-gray-100 border-2 border-gray-200">
        {store.logo && (
          <img
            src={store.logo}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover scale-[1.4] blur-[14px] saturate-150 opacity-50 pointer-events-none"
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          {store.logo ? (
            <Image
              src={store.logo}
              alt={store.storeName}
              width={56}
              height={56}
              className="w-full h-full object-cover relative z-10"
            />
          ) : (
            <span className="text-xl font-display font-black text-primary relative z-10">{initials}</span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-sm font-display font-semibold text-foreground tracking-tight truncate">
            {store.storeName}
          </span>
          <StatusBadge status={store.status} />
        </div>
        {store.description && (
          <p className="text-[12px] text-gray-400 mt-0.5 truncate font-body">{store.description}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link href={`/dashboard/my-store/${store.slug || store._id}/edit`}>
          <button className="text-[12px] font-mono font-medium uppercase tracking-wider text-gray-500 border-2 border-gray-200 rounded-none px-3.5 py-1.5 hover:border-primary hover:text-primary transition-all duration-200">
            Editar
          </button>
        </Link>
        <Link href={`/dashboard/my-store/${store.slug || store._id}/products`}>
          <button className="text-[12px] font-mono font-medium uppercase tracking-wider text-white bg-foreground rounded-none px-3.5 py-1.5 hover:bg-gray-700 transition-all duration-200 border-2 border-foreground">
            Productos
          </button>
        </Link>
      </div>

    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    approved: 'bg-success-bg text-success border-success/30',
    pending: 'bg-warning-bg text-warning border-warning/30',
    rejected: 'bg-danger-bg text-danger border-danger/30',
  };

  const cls = variants[status.toLowerCase()] ?? 'bg-gray-100 text-gray-600 border-gray-300';

  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-medium px-2.5 py-1 border-2 uppercase tracking-wider ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-none bg-current" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
