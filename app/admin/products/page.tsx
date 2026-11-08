/* Product images come from Supabase storage hosts; next/image would need
   remotePatterns churn across buckets. */
/* eslint-disable @next/next/no-img-element */
'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRequireRole } from '@/hooks/use-auth';
import { productApi } from '@/lib/api/products';
import { storeApi } from '@/lib/api/stores';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import type { Product, Store } from '@/types';
import {
  AccessDenied,
  EmptyState,
  ErrorBanner,
  GlassPanel,
  LiquidShell,
  LoadingState,
  PageHeader,
  SearchInput,
} from '@/components/admin/glass';
import { HBarChart, type ChartDatum } from '@/components/admin/charts';

const TOP_STORES_IN_CHART = 6;
const UNKNOWN_STORE_LABEL = 'Tienda desconocida';

/**
 * Cuenta productos por tienda y devuelve las `limit` con más productos.
 *
 * @param products Productos cargados.
 * @param stores Mapa de tiendas por id, para resolver el nombre.
 */
function buildProductsByStore(products: Product[], stores: Map<string, Store>, limit: number): ChartDatum[] {
  const counts = new Map<string, number>();
  products.forEach((p) => counts.set(p.storeId, (counts.get(p.storeId) ?? 0) + 1));
  return [...counts.entries()]
    .map(([storeId, value]) => ({ id: storeId, label: stores.get(storeId)?.storeName || UNKNOWN_STORE_LABEL, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

/** `true` si el producto coincide con el texto de búsqueda (nombre o descripción). */
function matchesSearch(product: Product, query: string): boolean {
  const q = query.toLowerCase();
  return product.name.toLowerCase().includes(q) || Boolean(product.description?.toLowerCase().includes(q));
}

export default function AdminProductsPage() {
  const { user, isAuthenticated, isLoading: roleLoading } = useRequireRole(['admin']);
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Map<string, Store>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [storeFilter, setStoreFilter] = useState<string | null>(null);
  const [page] = useState(1);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    (async () => {
      setIsLoading(true);
      try {
        const [productsData, storesData] = await Promise.all([
          productApi.getAll({ page, limit: 20, search: search || undefined }),
          storeApi.getAll(),
        ]);
        // GET /stores devuelve el wrapper paginado { data, total, ... }, no un array.
        const storesMap = new Map<string, Store>();
        (storesData as { data?: Store[] }).data?.forEach((s: Store) => storesMap.set(s._id, s));
        setStores(storesMap);
        const result = productsData as { data?: Product[]; products?: Product[]; items?: Product[] };
        setProducts(result.data || result.products || result.items || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar productos');
      } finally {
        setIsLoading(false);
      }
    })();
    // `search` intentionally excluded: filtering happens client-side; adding it
    // would cancel in-flight fetches on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, page]);

  /** Elimina un producto tras confirmación del usuario. */
  const handleDelete = async (productId: string) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    try {
      await apiClient.delete(API_ENDPOINTS.admin.products.delete(productId));
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const chartData = useMemo(() => buildProductsByStore(products, stores, TOP_STORES_IN_CHART), [products, stores]);

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (p) => (!storeFilter || p.storeId === storeFilter) && (!search || matchesSearch(p, search)),
      ),
    [products, storeFilter, search],
  );

  if (roleLoading || isLoading) return <LoadingState label="Cargando productos" />;
  if (!isAuthenticated) return <AccessDenied />;

  return (
    <LiquidShell>
      <PageHeader eyebrow="Administración" title="Gestionar Productos" backHref="/admin" />

      <ErrorBanner message={error} />

      {chartData.length > 0 && (
        <GlassPanel
          className="mb-5"
          title="Productos por tienda"
          aside={<span className="lg-muted">{storeFilter ? 'clic de nuevo para quitar el filtro' : 'clic para filtrar'}</span>}
        >
          <HBarChart data={chartData} selectedId={storeFilter} onSelect={setStoreFilter} />
        </GlassPanel>
      )}

      <div className="mb-5">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar productos..." />
      </div>

      <GlassPanel
        title="Todos los productos"
        flush
        aside={<span className="lg-badge"><i />{filteredProducts.length}</span>}
      >
        {filteredProducts.length === 0 ? (
          <EmptyState icon="📦" title="No hay productos" />
        ) : (
          filteredProducts.map((product) => {
            const store = stores.get(product.storeId);
            return (
              <div key={product._id} className="lg-row">
                <div className="lg-avatar">
                  {product.mainImageUrl && <img src={product.mainImageUrl} alt={product.name} loading="lazy" />}
                </div>
                <div className="lg-row__main">
                  <p className="lg-row__title">{product.name}</p>
                  <p className="lg-row__sub">
                    {store?.storeName || UNKNOWN_STORE_LABEL} • {product.price != null ? `$${product.price}` : 'Sin precio'}
                  </p>
                </div>
                <button type="button" onClick={() => handleDelete(product._id)} className="lg-btn lg-btn--danger lg-btn--sm shrink-0">
                  ✕ Eliminar
                </button>
              </div>
            );
          })
        )}
      </GlassPanel>
    </LiquidShell>
  );
}