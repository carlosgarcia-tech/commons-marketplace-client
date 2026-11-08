import { useState, useEffect, useCallback } from 'react';
import type { Product, ProductFilters } from '@/types';
import { productApi } from '@/lib/api';

interface UseProductsResult {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
  refetch: () => void;
}

const productsCache = new Map<string, { data: Product[]; timestamp: number; total: number; totalPages: number }>();
const productByIdCache = new Map<string, { data: Product; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 2;

function getCacheKey(filters?: ProductFilters) {
  return `${filters?.categoryId || 'all'}-${filters?.search || ''}-${filters?.page || 1}-${filters?.limit || 12}`;
}

export function useProducts(filters?: ProductFilters): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchProducts = useCallback(async () => {
    const cacheKey = getCacheKey(filters);
    const cached = productsCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setProducts(cached.data);
      setTotal(cached.total);
      setTotalPages(cached.totalPages);
      setPage(filters?.page || 1);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await productApi.getAll({
        ...filters,
        page: filters?.page || 1,
        limit: filters?.limit || 12,
      }) as { products?: Product[]; data?: Product[]; pagination?: { totalItems?: number; currentPage?: number; totalPages?: number }; total?: number; page?: number; totalPages?: number };

      let resultProducts: Product[] = [];
      let resultTotal = 0;
      let resultPage = 1;
      let resultTotalPages = 0;

      if (response?.products && Array.isArray(response.products)) {
        const pagination = response.pagination || { totalItems: 0, currentPage: 1, totalPages: 1 };
        resultProducts = response.products;
        resultTotal = pagination.totalItems || response.products.length;
        resultPage = pagination.currentPage || 1;
        resultTotalPages = pagination.totalPages || 1;
      } else if (response?.data && Array.isArray(response.data)) {
        resultProducts = response.data;
        resultTotal = response.total || 0;
        resultPage = response.page || 1;
        resultTotalPages = response.totalPages || 0;
      }

      setProducts(resultProducts);
      setTotal(resultTotal);
      setPage(resultPage);
      setTotalPages(resultTotalPages);

      productsCache.set(cacheKey, {
        data: resultProducts,
        timestamp: Date.now(),
        total: resultTotal,
        totalPages: resultTotalPages,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos');
    } finally {
      setIsLoading(false);
    }
    // filters object identity changes on each render; only its fields matter
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.categoryId, filters?.search, filters?.page, filters?.limit]);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) fetchProducts();
    });
    return () => {
      cancelled = true;
    };
  }, [fetchProducts]);

  return {
    products: products ?? [],
    isLoading,
    error,
    total,
    page,
    totalPages,
    refetch: fetchProducts,
  };
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      const cached = productByIdCache.get(id);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setProduct(cached.data);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const data = await productApi.getById(id);
        productByIdCache.set(id, { data, timestamp: Date.now() });
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar producto');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  return { product, isLoading, error };
}
