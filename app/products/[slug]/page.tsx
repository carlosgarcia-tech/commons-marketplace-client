import type { Metadata } from 'next';
import { ProductDetailClient } from './product-detail-client';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    
    const response = await fetch(
      `${process.env.INTERNAL_API_ORIGIN || "http://commons-proxy:80"}/api/v1/products/${slug}`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) {
      return { title: 'Producto no encontrado | Commons Marketplace' };
    }
    
    const product = await response.json();

    const seoTitle = product.name || 'Producto';
    const seoDesc = product.description || '';

    return {
      title: `${seoTitle} | Commons Marketplace`,
      description: seoDesc?.slice(0, 160) || '',
      openGraph: {
        title: seoTitle,
        description: seoDesc?.slice(0, 160) || '',
        type: 'website',
      },
    };
  } catch {
    return { title: 'Commons Marketplace' };
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  return <ProductDetailClient productId={slug} />;
}