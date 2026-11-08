'use client';

import { useEffect } from 'react';
import { useWishlistStore } from '@/store/wishlist-store';
import { useAuthStore } from '@/store/auth-store';
import { ProductCard } from '@/app/products/product-card';
import Link from 'next/link';

export default function WishlistPage() {
  const { isAuthenticated } = useAuthStore();
  const { items, isLoading, fetchWishlist, clearWishlist } = useWishlistStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    }
    // fetchWishlist is a stable store action; only auth toggles it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Mi Lista de Deseos</h1>
        <p>Debes iniciar sesión para ver tu lista de deseos.</p>
        <Link href="/login" className="text-primary hover:underline">
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mi Lista de Deseos</h1>
        {items.length > 0 && (
          <button
            onClick={() => clearWishlist()}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Limpiar lista
          </button>
        )}
      </div>

      {isLoading ? (
        <p>Cargando...</p>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Tu lista de deseos está vacía</p>
          <Link href="/products" className="text-primary hover:underline">
            Ver productos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => {
            const product = item.productId;
            if (!product || !product._id || !product.price) return null;
            return <ProductCard key={item._id || product._id} product={product} />;
          })}
        </div>
      )}
    </div>
  );
}