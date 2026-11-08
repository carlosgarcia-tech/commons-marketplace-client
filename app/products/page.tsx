import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ProductsList } from './products-list';
import { CategoriesSidebar } from './categories-sidebar';
import { SearchBar } from './search-bar';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Productos | Commons Marketplace',
  description: 'Explora todos los productos disponibles en nuestro marketplace de vendedores locales',
  openGraph: {
    title: 'Productos | Commons Marketplace',
    description: 'Explora todos los productos disponibles en nuestro marketplace',
  },
  twitter: {
    card: 'summary',
    title: 'Productos | Commons Marketplace',
    description: 'Explora todos los productos disponibles en nuestro marketplace',
  },
};

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12 stagger-child">
        <h1 className="h1 text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
          Productos
        </h1>
        <p className="text-sm font-mono text-gray-400 tracking-wider">
          Explora todos los productos disponibles en nuestro marketplace
        </p>
      </div>

      <SearchBar />

      <div className="mt-10 flex gap-8">
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <CategoriesSidebar />
          </div>
        </aside>

        <div className="flex-1">
          <Suspense
            fallback={
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="glass h-80 rounded-2xl animate-pulse" />
                ))}
              </div>
            }
          >
            <ProductsList />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
