/* Images come from arbitrary Supabase storage hosts; next/image would
   require host-by-host remotePatterns churn. */
/* eslint-disable @next/next/no-img-element */
'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/hooks/use-stores';
import { StoreProducts } from './store-products';
import { Spinner } from '@/components/ui';

interface StoreDetailClientProps {
  storeId: string;
}

export function StoreDetailClient({ storeId }: StoreDetailClientProps) {
  const { store, isLoading, error } = useStore(storeId);

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Spinner />
      </div>
    );
  }

  if (error || !store) {
    return notFound();
  }

  const initials = store.storeName.charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Back */}
      <Link
        href="/stores"
        className="inline-flex items-center gap-2 text-xs font-mono text-gray-500 hover:text-foreground mb-8 transition-colors duration-200"
      >
        <span aria-hidden>‹</span>
        <span>Volver a tiendas</span>
      </Link>

      {/* Hero header: the store's own light, materialized */}
      <div className="relative glass rounded-2xl mb-10 overflow-hidden">
        <div className="relative h-44 overflow-hidden bg-[var(--gray-50)]">
          {store.logo ? (
            <img
              src={store.logo}
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover scale-[1.4] blur-[40px] saturate-[1.8] opacity-40 pointer-events-none"
            />
          ) : (
            <div
              className="absolute inset-0 opacity-25"
              style={{
                background:
                  'radial-gradient(600px 300px at 30% 0%, var(--aurora-1), transparent 70%), radial-gradient(500px 300px at 80% 100%, var(--aurora-2), transparent 70%)',
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--glass-bg)]" />
        </div>

        {/* Logo + info */}
        <div className="px-8 pb-8">
          <div className="relative w-[96px] h-[96px] rounded-3xl overflow-hidden glass-strong -mt-12 z-10">
            {store.logo ? (
              <img
                src={store.logo}
                alt={store.storeName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-4xl font-medium text-primary">{initials}</span>
              </div>
            )}
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="h1 text-2xl md:text-3xl text-foreground">{store.storeName}</h1>
              <StatusBadge status={store.status} />
            </div>
            {store.description && (
              <p className="mt-2 text-sm font-light text-[var(--text-secondary)] leading-relaxed max-w-2xl">
                {store.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Products */}
      <div>
        <h2 className="h2 text-xl mb-6">Productos de la tienda</h2>
        <StoreProducts storeId={storeId} />
      </div>

    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    approved: 'text-[var(--success)] bg-[var(--success-bg)] border-[var(--success)]/25',
    pending: 'text-[var(--warning)] bg-[var(--warning-bg)] border-[var(--warning)]/25',
    rejected: 'text-[var(--danger)] bg-[var(--danger-bg)] border-[var(--danger)]/25',
  };

  const cls = variants[status.toLowerCase()] ?? 'text-[var(--text-secondary)]';

  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-medium px-2.5 py-1 rounded-full glass-chip ${cls}`}>
      <span className="w-1.5 h-1.5 bg-current" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
