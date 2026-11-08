/* Camera-roll feel: plain img swap on slide; next/image adds nothing here */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useCallback } from 'react';
import { notFound } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useProduct } from '@/hooks/use-products';
import { useAuth } from '@/hooks/use-auth';
import { Button, Badge, Skeleton } from '@/components/ui';
import { ReviewsSection } from './reviews-list';

interface ProductDetailClientProps {
  productId: string;
}

export function ProductDetailClient({ productId }: ProductDetailClientProps) {
  const { product, isLoading, error } = useProduct(productId);
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();

  const handleContactSeller = () => {
    if (!isAuthenticated) {
      // Keep the destination so login returns to this product, not home.
      router.push(`/login?callbackUrl=${encodeURIComponent(`/products/${productId}`)}`);
      return;
    }
    if (product?.sellerId) {
      window.dispatchEvent(new CustomEvent('open-chat', { detail: { sellerId: product.sellerId } }));
    }
  };

  const allImages = !isLoading && product
    ? [product.mainImageUrl, ...(product.imageUrls || [])].filter(Boolean)
    : [];

  const goTo = useCallback((index: number) => {
    if (index < 0) setSelectedImage(allImages.length - 1);
    else if (index >= allImages.length) setSelectedImage(0);
    else setSelectedImage(index);
  }, [allImages.length]);

  // 1:1 tracking: the thumbnails cross-fade without treating a swipe as a jump;
  // direction comes straight from the finger delta
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(selectedImage + (diff > 0 ? 1 : -1));
    setTouchStart(null);
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-4">
            <Skeleton className="h-96 w-full rounded-2xl" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-20 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Back */}
      <Link href="/products" className="inline-flex items-center gap-2 text-xs font-mono text-gray-500 hover:text-foreground mb-6 transition-colors duration-200">
        <span aria-hidden>‹</span>
        <span>Volver a productos</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Gallery */}
        <div className="space-y-4">
          <div
            className="relative h-96 glass rounded-[2rem] overflow-hidden bg-[var(--gray-50)]"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.img
                key={selectedImage}
                src={allImages[selectedImage]}
                alt={product.name}
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 w-full h-full object-contain p-8"
              />
            </AnimatePresence>

            {allImages.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.preventDefault(); goTo(selectedImage - 1); }}
                  aria-label="Imagen anterior"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full glass-chip grid place-items-center text-gray-500 hover:text-foreground transition-colors duration-200"
                >
                  ‹
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); goTo(selectedImage + 1); }}
                  aria-label="Imagen siguiente"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full glass-chip grid place-items-center text-gray-500 hover:text-foreground transition-colors duration-200"
                >
                  ›
                </button>
              </>
            )}
          </div>

          {/* Thumbnails: anchored to the source image */}
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  aria-label={`Ver imagen ${idx + 1}`}
                  aria-current={idx === selectedImage}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden glass-chip transition-all duration-200 ${
                    idx === selectedImage ? 'border-primary/50 shadow-[0_0_0_1px_rgba(62,207,178,0.4)]' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6 glass panel p-6 md:p-8 h-fit">
          <div>
            <h1 className="h1 text-2xl md:text-3xl mb-3">{product.name}</h1>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-mono font-semibold text-white">
                ${product.price.toFixed(2)}
              </span>
              <Badge variant={product.status === 'Active' ? 'success' : 'warning'} className="text-[10px]">
                {product.status}
              </Badge>
            </div>
          </div>

          {product.description && (
            <p className="text-sm font-light text-[var(--text-secondary)] leading-relaxed">{product.description}</p>
          )}

          <div className="text-xs font-mono text-[var(--text-secondary)] space-y-1 pt-4 border-t border-[var(--glass-border)]">
            <p>Stock disponible: {product.stock}</p>
            {product.category && (
              <p>
                Categoría:{' '}
                <Link href={`/products?category=${product.category._id}`} className="text-[var(--text-highlight)] hover:text-white underline decoration-white/20 underline-offset-4 transition-colors">
                  {product.category.name}
                </Link>
              </p>
            )}
            {product.store && (
              <p>
                Tienda:{' '}
                <Link href={`/stores/${product.store.slug || product.store._id}`} className="text-[var(--text-highlight)] hover:text-white underline decoration-white/20 underline-offset-4 transition-colors">
                  {product.store.storeName}
                </Link>
              </p>
            )}
          </div>

          {isAuthenticated && user && (
            <div className="flex gap-3 pt-4 border-t border-[var(--glass-border)]">
              {user._id !== product.sellerId && (
                <Button variant="outline" onClick={handleContactSeller} className="flex-1 text-xs font-mono">
                  Contactar vendedor
                </Button>
              )}
              <Button className="flex-1 text-xs font-mono">
                Agregar al carrito
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-16 pt-8 border-t border-[var(--glass-border)]">
        <h2 className="h2 text-xl mb-6">Reseñas</h2>
        <ReviewsSection productId={product._id || product.id} />
      </div>
    </div>
  );
}
