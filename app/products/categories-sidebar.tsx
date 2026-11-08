'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCategories } from '@/hooks/use-categories';

function CategoriesSkeleton() {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="h-5 w-24 bg-gray-200 rounded-full mb-4 animate-pulse" />
      <div className="space-y-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 w-full bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export function CategoriesSidebar() {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category');
  const { categories, isLoading, error } = useCategories();

  if (isLoading || !categories) {
    return <CategoriesSkeleton />;
  }

  if (error) {
    return <p className="text-danger text-sm p-4">{error}</p>;
  }

  return (
    <div className="glass rounded-2xl p-4">
      <h3 className="font-medium text-foreground mb-4 tracking-tight">Categorías</h3>
      <div className="space-y-1">
        <Link
          href="/products"
          className={`block px-3 py-2 rounded-xl transition-colors text-sm ${
            !currentCategory
              ? 'bg-primary-ghost text-primary font-medium'
              : 'text-gray-500 hover:text-foreground hover:bg-white/5'
          }`}
        >
          Todas las categorías
        </Link>
        {categories.map((category) => (
          <Link
            key={category._id}
            href={`/products?category=${category._id}`}
            className={`block px-3 py-2 rounded-xl transition-colors text-sm ${
              currentCategory === category._id
                ? 'bg-primary-ghost text-primary font-medium'
                : 'text-gray-500 hover:text-foreground hover:bg-white/5'
            }`}
          >
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
