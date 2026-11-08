'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProducts } from '@/hooks/use-products';
import { ProductCard } from './product-card';
import { Button, Skeleton } from '@/components/ui';
import { getProductId } from '@/types';

function ProductsListContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryId = searchParams.get('category') || undefined;
  const search = searchParams.get('search') || undefined;
  const pageParam = searchParams.get('page');
  const page = pageParam ? Number(pageParam) : 1;

  const { products, isLoading, error, total, page: currentPage, totalPages, refetch } = useProducts({
    categoryId,
    search,
    page,
    limit: 12,
  });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`/products?${params.toString()}`);
  };

  if (isLoading || !products) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger-child">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-52 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 glass rounded-2xl">
        <p className="text-danger text-sm">{error}</p>
        <Button onClick={refetch} variant="outline" className="mt-6 text-xs font-mono">
          Reintentar
        </Button>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16 glass rounded-2xl">
        <p className="text-gray-500 text-sm">No se encontraron productos</p>
        <p className="text-gray-400 text-xs mt-2">Probá con otra búsqueda o categoría</p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-6 text-xs font-mono text-gray-400 tracking-wider border-b border-[var(--glass-border)] pb-3">
        {total} productos encontrados
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <div
            key={getProductId(product) || `product-${index}`}
            style={{
              animationDelay: `${index * 80}ms`,
              animationFillMode: 'both',
            }}
            className="animate-fadeInUp"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-12 flex justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="font-mono text-xs"
          >
            Anterior
          </Button>
          <span className="flex items-center px-4 text-xs font-mono text-gray-600">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="font-mono text-xs"
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}

export function ProductsList() {
  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      }
    >
      <ProductsListContent />
    </Suspense>
  );
}
