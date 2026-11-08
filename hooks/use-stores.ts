import { useState, useEffect, useRef, useCallback } from 'react';
import type { Store } from '@/types';
import { storeApi } from '@/lib/api';

interface UseStoresResult {
  stores: Store[];
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
  refetch: () => void;
}

const storesCache = new Map<string, { data: Store[]; timestamp: number; total: number; totalPages: number }>();
const storeByIdCache = new Map<string, { data: Store; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 2; 

function getCacheKey(filters?: { status?: string; page?: number; limit?: number }) {
  return `${filters?.status || 'all'}-${filters?.page || 1}-${filters?.limit || 10}`;
}

export function useStores(filters?: { status?: string; page?: number; limit?: number }): UseStoresResult {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const fetchedRef = useRef(false);

  const fetchStores = useCallback(async () => {
    const cacheKey = getCacheKey(filters);
    const cached = storesCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setStores(cached.data);
      setTotal(cached.total);
      setTotalPages(cached.totalPages);
      setPage(filters?.page || 1);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await storeApi.getAll(filters) as { data?: Store[]; total?: number; page?: number; totalPages?: number };
      if (response?.data) {
        setStores(response.data);
        setTotal(response.total || 0);
        setPage(response.page || 1);
        setTotalPages(response.totalPages || 0);
        storesCache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now(),
          total: response.total || 0,
          totalPages: response.totalPages || 0,
        });
      } else {
        setStores(Array.isArray(response) ? response : []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar tiendas');
    } finally {
      setIsLoading(false);
    }
    // filters object identity changes on each render; only its fields matter
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.status, filters?.page, filters?.limit]);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchStores();
  }, [fetchStores]);

  return {
    stores: stores ?? [],
    isLoading,
    error,
    total,
    page,
    totalPages,
    refetch: fetchStores,
  };
}

export function useStore(id: string) {
  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchStore = async () => {
      const cached = storeByIdCache.get(id);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setStore(cached.data);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const data = await storeApi.getById(id);
        storeByIdCache.set(id, { data, timestamp: Date.now() });
        setStore(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar tienda');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStore();
  }, [id]);

  return { store, isLoading, error };
}