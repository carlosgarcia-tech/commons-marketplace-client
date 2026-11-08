import { Suspense } from 'react';
import type { Metadata } from 'next';
import { StoresList } from './stores-list';

export const metadata: Metadata = {
  title: 'Tiendas | Commons Marketplace',
  description: 'Descubre las tiendas disponibles en nuestro marketplace de vendedores locales',
  openGraph: {
    title: 'Tiendas | Commons Marketplace',
    description: 'Descubre las tiendas disponibles en nuestro marketplace',
  },
  twitter: {
    card: 'summary',
    title: 'Tiendas | Commons Marketplace',
    description: 'Descubre las tiendas disponibles en nuestro marketplace',
  },
};

export default function StoresPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12 stagger-child">
        <h1 className="h1 text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
          Tiendas
        </h1>
        <p className="text-sm font-mono text-gray-400 tracking-wider">
          Descubre las tiendas disponibles en nuestro marketplace
        </p>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="glass h-64 rounded-2xl animate-pulse" />
            ))}
          </div>
        }
      >
        <StoresList />
      </Suspense>
    </div>
  );
}
