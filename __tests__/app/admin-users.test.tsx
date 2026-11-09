import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

describe('AdminUsersPage', () => {
  it('debe mostrar estado de carga', async () => {
    vi.doMock('next/navigation', () => ({
      useRouter: () => ({ push: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
    }));
    vi.doMock('@/components/ui', () => ({
      Spinner: () => <div data-testid="spinner" />,
    }));
    vi.doMock('@/hooks/use-auth', () => ({
      useRequireRole: vi.fn().mockReturnValue({
        user: null, isAuthenticated: false, isLoading: true,
      }),
    }));
    vi.doMock('@/lib/api', () => ({
      apiClient: { get: vi.fn() },
      API_ENDPOINTS: {
        users: { list: '/api/users' },
      },
    }));

    const { default: AdminUsersPage } = await import('@/app/admin/users/page');
    render(<AdminUsersPage />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('debe mostrar lista vacía cuando no hay usuarios', async () => {
    vi.doMock('next/navigation', () => ({
      useRouter: () => ({ push: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
    }));
    vi.doMock('@/components/ui', () => ({
      Spinner: () => <div data-testid="spinner" />,
    }));
    vi.doMock('@/hooks/use-auth', () => ({
      useRequireRole: vi.fn().mockReturnValue({
        user: { id: '1', name: 'Admin', role: 'admin' }, isAuthenticated: true, isLoading: false,
      }),
    }));
    vi.doMock('@/lib/api', () => ({
      apiClient: { get: vi.fn().mockResolvedValue([]) },
      API_ENDPOINTS: {
        users: { list: '/api/users' },
      },
    }));

    const { default: AdminUsersPage } = await import('@/app/admin/users/page');
    render(<AdminUsersPage />);
    await waitFor(() => {
      expect(screen.getByText('No hay usuarios')).toBeInTheDocument();
    });
  });

  it('debe renderizar usuarios con diferentes roles', async () => {
    vi.doMock('next/navigation', () => ({
      useRouter: () => ({ push: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
    }));
    vi.doMock('@/components/ui', () => ({
      Spinner: () => <div data-testid="spinner" />,
    }));
    vi.doMock('@/hooks/use-auth', () => ({
      useRequireRole: vi.fn().mockReturnValue({
        user: { id: '1', name: 'Admin', role: 'admin' }, isAuthenticated: true, isLoading: false,
      }),
    }));
    vi.doMock('@/lib/api', () => ({
      apiClient: {
        get: vi.fn().mockResolvedValue([
          { _id: 'u1', name: 'Carlos Admin', email: 'admin@test.com', role: 'admin' },
          { _id: 'u2', name: 'María Vendedora', email: 'seller@test.com', role: 'seller' },
          { _id: 'u3', name: 'Juan Usuario', email: 'user@test.com', role: 'user' },
        ]),
      },
      API_ENDPOINTS: {
        users: { list: '/api/users' },
      },
    }));

    const { default: AdminUsersPage } = await import('@/app/admin/users/page');
    render(<AdminUsersPage />);
    await waitFor(() => {
      expect(screen.getByText('Carlos Admin')).toBeInTheDocument();
      expect(screen.getByText('María Vendedora')).toBeInTheDocument();
      expect(screen.getByText('Juan Usuario')).toBeInTheDocument();
      // 'Admin'/'Vendedor'/'Usuario' aparecen tanto en el legend del donut como
      // en los badges de rol de cada fila: se busca al menos una ocurrencia.
      expect(screen.getAllByText('Admin').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Vendedor').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Usuario').length).toBeGreaterThan(0);
    });
  });

  it('debe filtrar usuarios por búsqueda', async () => {
    vi.doMock('next/navigation', () => ({
      useRouter: () => ({ push: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
    }));
    vi.doMock('@/components/ui', () => ({
      Spinner: () => <div data-testid="spinner" />,
    }));
    vi.doMock('@/hooks/use-auth', () => ({
      useRequireRole: vi.fn().mockReturnValue({
        user: { id: '1', name: 'Admin', role: 'admin' }, isAuthenticated: true, isLoading: false,
      }),
    }));
    vi.doMock('@/lib/api', () => ({
      apiClient: {
        get: vi.fn().mockResolvedValue([
          { _id: 'u1', name: 'Carlos Admin', email: 'admin@test.com', role: 'admin' },
          { _id: 'u2', name: 'María Vendedora', email: 'seller@test.com', role: 'seller' },
          { _id: 'u3', name: 'Juan Usuario', email: 'user@test.com', role: 'user' },
        ]),
      },
      API_ENDPOINTS: {
        users: { list: '/api/users' },
      },
    }));

    const { default: AdminUsersPage } = await import('@/app/admin/users/page');
    render(<AdminUsersPage />);
    await waitFor(() => {
      expect(screen.getByText('Carlos Admin')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Buscar nombre o email…'), {
      target: { value: 'María' },
    });
    await waitFor(() => {
      expect(screen.getByText('María Vendedora')).toBeInTheDocument();
      expect(screen.queryByText('Carlos Admin')).not.toBeInTheDocument();
      expect(screen.queryByText('Juan Usuario')).not.toBeInTheDocument();
    });
  });
});
