import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

describe('AdminCategoriesPage', () => {
  it('debe mostrar estado de carga', async () => {
    vi.doMock('next/navigation', () => ({
      useRouter: () => ({ push: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
    }));
    vi.doMock('@/components/ui', () => ({
      Input: (props: any) => <input {...props} />,
      Textarea: (props: any) => <textarea {...props} />,
      Spinner: () => <div className="animate-spin" data-testid="spinner" />,
    }));
    vi.doMock('@/hooks/use-auth', () => ({
      useRequireRole: vi.fn().mockReturnValue({
        user: null, isAuthenticated: false, isLoading: true,
      }),
    }));
    vi.doMock('@/lib/api', () => ({
      apiClient: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
      API_ENDPOINTS: {
        categories: {
          list: '/api/categories',
          create: '/api/categories',
          delete: (id: string) => `/api/categories/${id}`,
        },
      },
    }));

    const { default: AdminCategoriesPage } = await import('@/app/admin/categories/page');
    const { container } = render(<AdminCategoriesPage />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('debe mostrar lista vacía cuando no hay categorías', async () => {
    vi.doMock('next/navigation', () => ({
      useRouter: () => ({ push: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
    }));
    vi.doMock('@/components/ui', () => ({
      Input: (props: any) => <input {...props} />,
      Textarea: (props: any) => <textarea {...props} />,
      Spinner: () => <div className="animate-spin" data-testid="spinner" />,
    }));
    vi.doMock('@/hooks/use-auth', () => ({
      useRequireRole: vi.fn().mockReturnValue({
        user: { id: '1', name: 'Admin', role: 'admin' }, isAuthenticated: true, isLoading: false,
      }),
    }));
    vi.doMock('@/lib/api', () => ({
      apiClient: { get: vi.fn().mockResolvedValue([]), post: vi.fn(), delete: vi.fn() },
      API_ENDPOINTS: {
        categories: {
          list: '/api/categories',
          create: '/api/categories',
          delete: (id: string) => `/api/categories/${id}`,
        },
      },
    }));

    const { default: AdminCategoriesPage } = await import('@/app/admin/categories/page');
    render(<AdminCategoriesPage />);
    await waitFor(() => {
      expect(screen.getByText('Aún no hay categorías')).toBeInTheDocument();
    });
  });

  it('debe renderizar las categorías', async () => {
    vi.doMock('next/navigation', () => ({
      useRouter: () => ({ push: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
    }));
    vi.doMock('@/components/ui', () => ({
      Input: (props: any) => <input {...props} />,
      Textarea: (props: any) => <textarea {...props} />,
      Spinner: () => <div className="animate-spin" data-testid="spinner" />,
    }));
    vi.doMock('@/hooks/use-auth', () => ({
      useRequireRole: vi.fn().mockReturnValue({
        user: { id: '1', name: 'Admin', role: 'admin' }, isAuthenticated: true, isLoading: false,
      }),
    }));
    vi.doMock('@/lib/api', () => ({
      apiClient: {
        get: vi.fn().mockResolvedValue([
          { _id: 'c1', name: 'Electrónica', description: 'Dispositivos y gadgets' },
          { _id: 'c2', name: 'Moda', description: 'Ropa y accesorios' },
        ]),
        post: vi.fn(),
        delete: vi.fn(),
      },
      API_ENDPOINTS: {
        categories: {
          list: '/api/categories',
          create: '/api/categories',
          delete: (id: string) => `/api/categories/${id}`,
        },
      },
    }));

    const { default: AdminCategoriesPage } = await import('@/app/admin/categories/page');
    render(<AdminCategoriesPage />);
    await waitFor(() => {
      expect(screen.getByText('Electrónica')).toBeInTheDocument();
      expect(screen.getByText('Moda')).toBeInTheDocument();
      expect(screen.getByText('Dispositivos y gadgets')).toBeInTheDocument();
      expect(screen.getByText('Ropa y accesorios')).toBeInTheDocument();
    });
  });

  it('debe abrir y cerrar el formulario de creación', async () => {
    vi.doMock('next/navigation', () => ({
      useRouter: () => ({ push: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
    }));
    vi.doMock('@/components/ui', () => ({
      Input: (props: any) => <input {...props} />,
      Textarea: (props: any) => <textarea {...props} />,
      Spinner: () => <div className="animate-spin" data-testid="spinner" />,
    }));
    vi.doMock('@/hooks/use-auth', () => ({
      useRequireRole: vi.fn().mockReturnValue({
        user: { id: '1', name: 'Admin', role: 'admin' }, isAuthenticated: true, isLoading: false,
      }),
    }));
    vi.doMock('@/lib/api', () => ({
      apiClient: { get: vi.fn().mockResolvedValue([]), post: vi.fn(), delete: vi.fn() },
      API_ENDPOINTS: {
        categories: {
          list: '/api/categories',
          create: '/api/categories',
          delete: (id: string) => `/api/categories/${id}`,
        },
      },
    }));

    const { default: AdminCategoriesPage } = await import('@/app/admin/categories/page');
    render(<AdminCategoriesPage />);
    await waitFor(() => {
      expect(screen.getByText('Nueva categoría')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Nueva categoría'));
    await waitFor(() => {
      expect(screen.getByText('Completa los datos')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Cancelar'));
    await waitFor(() => {
      expect(screen.queryByText('Completa los datos')).not.toBeInTheDocument();
    });
  });

  it('debe crear una categoría', async () => {
    vi.doMock('next/navigation', () => ({
      useRouter: () => ({ push: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
    }));
    vi.doMock('@/components/ui', () => ({
      Input: (props: any) => <input {...props} />,
      Textarea: (props: any) => <textarea {...props} />,
      Spinner: () => <div className="animate-spin" data-testid="spinner" />,
    }));
    vi.doMock('@/hooks/use-auth', () => ({
      useRequireRole: vi.fn().mockReturnValue({
        user: { id: '1', name: 'Admin', role: 'admin' }, isAuthenticated: true, isLoading: false,
      }),
    }));
    const mockPost = vi.fn().mockResolvedValue({
      _id: 'c3', name: 'Hogar', description: 'Artículos para el hogar',
    });
    vi.doMock('@/lib/api', () => ({
      apiClient: { get: vi.fn().mockResolvedValue([]), post: mockPost, delete: vi.fn() },
      API_ENDPOINTS: {
        categories: {
          list: '/api/categories',
          create: '/api/categories',
          delete: (id: string) => `/api/categories/${id}`,
        },
      },
    }));

    const { default: AdminCategoriesPage } = await import('@/app/admin/categories/page');
    render(<AdminCategoriesPage />);
    await waitFor(() => {
      expect(screen.getByText('Nueva categoría')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Nueva categoría'));
    await waitFor(() => {
      expect(screen.getByText('Crear categoría')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Ej: Electrónica, Moda, Hogar…'), {
      target: { value: 'Hogar' },
    });
    fireEvent.change(screen.getByPlaceholderText('Breve descripción de la categoría…'), {
      target: { value: 'Artículos para el hogar' },
    });

    fireEvent.submit(screen.getByText('Crear categoría').closest('form')!);
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/api/categories', {
        name: 'Hogar',
        description: 'Artículos para el hogar',
        slug: 'hogar',
      });
      expect(screen.getByText('Hogar')).toBeInTheDocument();
    });
  });
});
