/* Images come from arbitrary Supabase storage hosts; next/image would
   require host-by-host remotePatterns churn. */
/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { memo } from 'react';
import type { Product } from '@/types';
import { Button, Badge } from '@/components/ui';
import { useWishlistStore } from '@/store/wishlist-store';
import { useAuthStore } from '@/store/auth-store';
import { getProductId, getProductSlug } from '@/types';

interface ProductCardProps {
  product: Product;
  showWishlist?: boolean;
  showEdit?: boolean;
  editHref?: string;
  showDelete?: boolean;
  onDelete?: (id: string) => void;
}

const NOISE_BG =
  'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")';

export const ProductCard = memo(function ProductCard({
  product,
  showWishlist = true,
  showEdit = false,
  showDelete = false,
  editHref,
  onDelete,
}: ProductCardProps) {
  const productId = getProductId(product);
  const productSlug = getProductSlug(product);
  const imageUrl = product.mainImageUrl || product.imageUrls?.[0] || '/placeholder-product.jpg';
  const { isAuthenticated } = useAuthStore();
  const { addToWishlist, removeFromWishlist, isInWishlist: checkInStore } = useWishlistStore();
  const isInWishlist = checkInStore(productId);

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    if (isInWishlist) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onDelete) return;
    const confirmed = window.confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`);
    if (confirmed) {
      await onDelete(productId);
    }
  };

  return (
    <div className="relative group">
      {/* Owner actions */}
      {showEdit && editHref && (
        <div className="absolute top-3 left-3 z-20">
          <Link href={editHref}>
            <Button
              variant="outline"
              size="sm"
              className="!bg-[var(--glass-bg-strong)] text-xs font-mono backdrop-blur-md"
            >
              Editar
            </Button>
          </Link>
        </div>
      )}

      {showDelete && onDelete && (
        <div className="absolute top-3 right-3 z-20">
          <Button
            variant="danger"
            size="sm"
            className="!bg-[var(--glass-bg-strong)] text-xs font-mono backdrop-blur-md"
            onClick={handleDeleteClick}
          >
            Eliminar
          </Button>
        </div>
      )}

      <Link href={`/products/${productSlug}`} className="block">
        <div className="industrial-card hover:-translate-y-1 group overflow-hidden">
          {/* Image */}
          <div
            className="relative bg-[var(--gray-50)] overflow-hidden rounded-t-[27px] border-b border-[var(--glass-border)]"
            style={{ aspectRatio: '4/3' }}
          >
            <img
              src={imageUrl}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-contain p-6 transition-transform duration-500 [transition-timing-function:var(--ease-out-expo)] group-hover:scale-[1.06]"
            />

            {/* Grain on image */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.04]"
              style={{ backgroundImage: NOISE_BG, backgroundSize: '128px 128px' }}
            />

            {/* Wishlist */}
            {showWishlist && (
              <button
                onClick={handleWishlistClick}
                disabled={!isAuthenticated}
                aria-label={isInWishlist ? 'Quitar de deseos' : 'Agregar a deseos'}
                className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full glass-chip grid place-items-center transition-all duration-200 ${
                  isInWishlist
                    ? 'text-white !bg-white/[0.15] !border-white/[0.25]'
                    : 'text-[var(--text-secondary)] hover:text-white hover:!bg-white/[0.1]'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <svg
                  className="w-4 h-4"
                  fill={isInWishlist ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
            )}

            {/* Out of stock */}
            {product.stock === 0 && (
              <div className="absolute inset-0 backdrop-blur-[3px] bg-black/50 flex items-center justify-center rounded-t-[27px]">
                <span className="glass-chip rounded-full text-xs font-medium px-4 py-1.5 text-[var(--text-secondary)]">
                  Sin stock
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-2 p-4">
            {product.store?.storeName && (
              <p className="text-[11px] font-mono text-[var(--gray-400)] tracking-wide truncate">
                {product.store.storeName}
              </p>
            )}
            <h3 className="font-medium text-foreground text-sm leading-snug line-clamp-2 min-h-[2.5rem] tracking-tight">
              {product.name}
            </h3>
            <div className="flex items-center justify-between mt-1 pt-3 border-t border-[var(--glass-border)]">
              <span className="text-lg font-mono font-semibold text-white">
                ${product.price.toFixed(2)}
              </span>
              {product.stock > 0 && (
                <Badge variant="success" className="text-[11px]">
                  {product.stock} en stock
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
});

export default ProductCard;
