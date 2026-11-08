/* Images come from arbitrary Supabase storage hosts; next/image would
   require host-by-host remotePatterns churn. */
/* eslint-disable @next/next/no-img-element */
'use client';

import { memo } from 'react';
import Link from 'next/link';
import { useStores } from '@/hooks/use-stores';
import { Skeleton, Button, Badge } from '@/components/ui';

interface Store {
  _id: string;
  id?: string;
  storeName: string;
  slug?: string;
  description?: string;
  logo?: string;
  status: string;
  accentColor?: string;
}

const StoreCard = memo(function StoreCard({ store }: { store: Store }) {
  const storeSlug = store.slug || store._id || store.id || '';
  const initials = store.storeName.charAt(0).toUpperCase();

  return (
    <Link href={`/stores/${storeSlug}`} className="group block focus:outline-none">
      <div className="industrial-card overflow-hidden">
        {/* Banner blur from the store's own logo */}
        <div className="relative h-[90px] overflow-hidden bg-[var(--gray-50)] rounded-t-[10px]">
          {store.logo ? (
            <img
              src={store.logo}
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover scale-[1.3] blur-[24px] saturate-[1.6] opacity-50 pointer-events-none"
            />
          ) : (
            <div
              className="absolute inset-0 opacity-25"
              style={{ background: store.accentColor ?? 'var(--primary)' }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--glass-bg)]" />
        </div>

        {/* Logo centered over banner */}
        <div className="flex justify-center">
          <div className="relative -mt-9 w-[72px] h-[72px] rounded-2xl overflow-hidden glass-strong flex items-center justify-center z-10">
            {store.logo ? (
              <img
                src={store.logo}
                alt={store.storeName}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            ) : (
              <span
                className="text-2xl font-medium"
                style={{ color: store.accentColor ?? 'var(--primary)' }}
              >
                {initials}
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-5 pt-3 pb-5 text-center">
          <p className="text-sm font-medium text-foreground tracking-tight truncate">
            {store.storeName}
          </p>

          {store.description && (
            <p className="text-[12px] text-gray-500 mt-1 line-clamp-2 leading-relaxed font-body">
              {store.description}
            </p>
          )}

          <div className="flex items-center justify-center mt-4 pt-3 border-t border-[var(--glass-border)]">
            <Badge
              variant={
                store.status === 'Approved'
                  ? 'success'
                  : store.status === 'Pending'
                  ? 'warning'
                  : 'danger'
              }
              className="text-[10px] font-mono"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
              {store.status}
            </Badge>
          </div>
        </div>
      </div>
    </Link>
  );
});

function StoreSkeleton() {
  return (
    <div className="glass overflow-hidden rounded-2xl">
      <Skeleton className="h-[90px] w-full rounded-none" />
      <div className="flex justify-center">
        <Skeleton className="-mt-9 w-[72px] h-[72px] rounded-2xl z-10 relative" />
      </div>
      <div className="px-5 pt-3 pb-5 flex flex-col items-center space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-5 w-20 mt-2" />
      </div>
    </div>
  );
}

export const StoresList = memo(function StoresList() {
  const { stores, isLoading, error, total, refetch } = useStores({
    status: 'Approved',
    limit: 12,
  });

  if (isLoading || !stores) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 stagger-child">
        {Array.from({ length: 10 }).map((_, i) => (
          <StoreSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 glass rounded-2xl col-span-full">
        <p className="text-danger text-sm">{error}</p>
        <Button onClick={refetch} variant="outline" className="mt-6 text-xs font-mono">
          Reintentar
        </Button>
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="text-center py-16 glass rounded-2xl col-span-full">
        <p className="text-gray-500 text-sm">No hay tiendas disponibles</p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-6 text-xs font-mono text-gray-400 tracking-wider border-b border-[var(--glass-border)] pb-3">
        {total} tiendas encontradas
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 stagger-child">
        {stores.map((store) => (
          <StoreCard key={store._id} store={store} />
        ))}
      </div>
    </div>
  );
});

export default StoresList;
