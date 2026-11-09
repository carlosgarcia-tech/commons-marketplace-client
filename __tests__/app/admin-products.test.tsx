import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

describe('AdminProductsPage', () => {
  it('debe mostrar estado de carga', async () => {
    vi.doMock('next/navigation', () => ({
      useRouter: () => ({ push: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
    }));
    vi.doMock('next/link', () => ({
      default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
    }));
    vi.doMock('@/components/ui', () => ({
      Button: (props: any) => <button {...props} />,
      Input: (props: any) => <input {...props} />,
      Spinner: () => <div data-testid="spinner" />,
    }));
    vi.doMock('@/hooks/use-auth', () => ({
      useRequireRole: vi.fn().mockReturnValue({
        user: null, isAuthenticated: false, isLoading: true,
      }),
    }));
    vi.doMock('@/lib/api/products', () => ({
      productApi: { getAll: vi.fn() },
    }));
    vi.doMock('@/lib/api/stores', () => ({
      storeApi: { getAll: vi.fn() },
    }));
    vi.doMock('@/lib/api', () => ({
      apiClient: { delete: vi.fn() },
      API_ENDPOINTS: {
        admin: { products: { delete: (id: string) => `/admin/products/${id}` } },
      },
    }));

    const { default: AdminProductsPage } = await import('@/app/admin/products/page');
    render(<AdminProductsPage />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('debe mostrar lista vacía cuando no hay productos', async () => {
    vi.doMock('next/navigation', () => ({
      useRouter: () => ({ push: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
    }));
    vi.doMock('next/link', () => ({
      default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
    }));
    vi.doMock('@/components/ui', () => ({
      Button: (props: any) => <button {...props} />,
      Input: (props: any) => <input {...props} />,
      Spinner: () => <div data-testid="spinner" />,
    }));
    vi.doMock('@/hooks/use-auth', () => ({
      useRequireRole: vi.fn().mockReturnValue({
        user: { id: '1', name: 'Admin', role: 'admin' }, isAuthenticated: true, isLoading: false,
      }),
    }));
    vi.doMock('@/lib/api/products', () => ({
      productApi: { getAll: vi.fn().mockResolvedValue({ data: [] }) },
    }));
    vi.doMock('@/lib/api/stores', () => ({
      storeApi: { getAll: vi.fn().mockResolvedValue([]) },
    }));
    vi.doMock('@/lib/api', () => ({
      apiClient: { delete: vi.fn() },
      API_ENDPOINTS: {
        admin: { products: { delete: (id: string) => `/admin/products/${id}` } },
      },
    }));

    const { default: AdminProductsPage } = await import('@/app/admin/products/page');
    render(<AdminProductsPage />);
    await waitFor(() => {
      expect(screen.getByText('No hay productos')).toBeInTheDocument();
    });
  });

  it('debe renderizar la lista de productos', async () => {
    vi.doMock('next/navigation', () => ({
      useRouter: () => ({ push: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
    }));
    vi.doMock('next/link', () => ({
      default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
    }));
    vi.doMock('@/components/ui', () => ({
      Button: (props: any) => <button {...props} />,
      Input: (props: any) => <input {...props} />,
      Spinner: () => <div data-testid="spinner" />,
    }));
    vi.doMock('@/hooks/use-auth', () => ({
      useRequireRole: vi.fn().mockReturnValue({
        user: { id: '1', name: 'Admin', role: 'admin' }, isAuthenticated: true, isLoading: false,
      }),
    }));
    vi.doMock('@/lib/api/products', () => ({
      productApi: {
        getAll: vi.fn().mockResolvedValue({
          data: [
            { _id: 'p1', name: 'Laptop Gamer', price: 999, storeId: 's1', mainImageUrl: '/laptop.jpg' },
            { _id: 'p2', name: 'Mouse Óptico', price: 25, storeId: 's1', mainImageUrl: '/mouse.jpg' },
          ],
        }),
      },
    }));
    vi.doMock('@/lib/api/stores', () => ({
      storeApi: {
        getAll: vi.fn().mockResolvedValue({
          data: [{ _id: 's1', storeName: 'Tech Store' }],
        }),
      },
    }));
    vi.doMock('@/lib/api', () => ({
      apiClient: { delete: vi.fn() },
      API_ENDPOINTS: {
        admin: { products: { delete: (id: string) => `/admin/products/${id}` } },
      },
    }));

    const { default: AdminProductsPage } = await import('@/app/admin/products/page');
    render(<AdminProductsPage />);
    await waitFor(() => {
      expect(screen.getByText('Laptop Gamer')).toBeInTheDocument();
      expect(screen.getByText('Mouse Óptico')).toBeInTheDocument();
      expect(screen.getByText(/Tech Store\s*•\s*\$999/)).toBeInTheDocument();
      expect(screen.getByText(/Tech Store\s*•\s*\$25/)).toBeInTheDocument();
    });
  });

  it('debe filtrar productos por búsqueda', async () => {
    vi.doMock('next/navigation', () => ({
      useRouter: () => ({ push: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
    }));
    vi.doMock('next/link', () => ({
      default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
    }));
    vi.doMock('@/components/ui', () => ({
      Button: (props: any) => <button {...props} />,
      Input: (props: any) => <input {...props} />,
      Spinner: () => <div data-testid="spinner" />,
    }));
    vi.doMock('@/hooks/use-auth', () => ({
      useRequireRole: vi.fn().mockReturnValue({
        user: { id: '1', name: 'Admin', role: 'admin' }, isAuthenticated: true, isLoading: false,
      }),
    }));
    vi.doMock('@/lib/api/products', () => ({
      productApi: {
        getAll: vi.fn().mockResolvedValue({
          data: [
            { _id: 'p1', name: 'Laptop Gamer', price: 999, storeId: 's1' },
            { _id: 'p2', name: 'Mouse Óptico', price: 25, storeId: 's1' },
            { _id: 'p3', name: 'Teclado Mecánico', price: 75, storeId: 's1' },
          ],
        }),
      },
    }));
    vi.doMock('@/lib/api/stores', () => ({
      storeApi: {
        getAll: vi.fn().mockResolvedValue({
          data: [{ _id: 's1', storeName: 'Tech Store' }],
        }),
      },
    }));
    vi.doMock('@/lib/api', () => ({
      apiClient: { delete: vi.fn() },
      API_ENDPOINTS: {
        admin: { products: { delete: (id: string) => `/admin/products/${id}` } },
      },
    }));

    const { default: AdminProductsPage } = await import('@/app/admin/products/page');
    render(<AdminProductsPage />);
    await waitFor(() => {
      expect(screen.getByText('Laptop Gamer')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Buscar productos...'), {
      target: { value: 'Laptop' },
    });
    await waitFor(() => {
      expect(screen.getByText('Laptop Gamer')).toBeInTheDocument();
      expect(screen.queryByText('Mouse Óptico')).not.toBeInTheDocument();
      expect(screen.queryByText('Teclado Mecánico')).not.toBeInTheDocument();
    });
  });
});
