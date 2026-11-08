import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

const mockAuthState = { user: null as any, isAuthenticated: false };
vi.mock('@/store/auth-store', () => ({
  useAuthStore: Object.assign(vi.fn(() => mockAuthState), {
    getState: vi.fn(() => mockAuthState),
    setState: vi.fn(),
  }),
}));

vi.mock('@/store/wishlist-store', () => ({
  useWishlistStore: Object.assign(vi.fn(() => ({ items: [] })), {
    getState: vi.fn(() => ({ items: [] })),
    setState: vi.fn(),
  }),
}));

vi.mock('@/hooks/use-stores', () => ({
  useStores: vi.fn(),
}));

import { useStores } from '@/hooks/use-stores';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('StoresList', () => {
  it('should show loading skeletons', async () => {
    vi.mocked(useStores).mockReturnValue({
      stores: [], isLoading: true, error: null, total: 0, page: 1, totalPages: 0, refetch: vi.fn(),
    });
    const { StoresList } = await import('@/app/stores/stores-list');
    const { container } = render(<StoresList />);
    expect(container.querySelector('.bg-gray-100')).toBeInTheDocument();
  });

  it('should show error state', async () => {
    vi.mocked(useStores).mockReturnValue({
      stores: [], isLoading: false, error: 'Network error', total: 0, page: 1, totalPages: 0, refetch: vi.fn(),
    });
    const { StoresList } = await import('@/app/stores/stores-list');
    render(<StoresList />);
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('should show empty state', async () => {
    vi.mocked(useStores).mockReturnValue({
      stores: [], isLoading: false, error: null, total: 0, page: 1, totalPages: 0, refetch: vi.fn(),
    });
    const { StoresList } = await import('@/app/stores/stores-list');
    render(<StoresList />);
    expect(screen.getByText(/No hay tiendas disponibles/)).toBeInTheDocument();
  });

  it('should render store cards', async () => {
    vi.mocked(useStores).mockReturnValue({
      stores: [
        { _id: 's1', storeName: 'Store One', slug: 'store-one', status: 'Approved', description: 'A store' },
        { _id: 's2', storeName: 'Store Two', slug: 'store-two', status: 'Pending' },
      ] as any,
      isLoading: false, error: null, total: 2, page: 1, totalPages: 1, refetch: vi.fn(),
    });
    const { StoresList } = await import('@/app/stores/stores-list');
    render(<StoresList />);
    expect(screen.getByText('Store One')).toBeInTheDocument();
    expect(screen.getByText('Store Two')).toBeInTheDocument();
    expect(screen.getByText('2 tiendas encontradas')).toBeInTheDocument();
  });

  it('should render store with logo', async () => {
    vi.mocked(useStores).mockReturnValue({
      stores: [
        { _id: 's1', storeName: 'Logo Store', slug: 'logo-store', status: 'Approved', logo: 'https://example.com/logo.png' },
      ] as any,
      isLoading: false, error: null, total: 1, page: 1, totalPages: 1, refetch: vi.fn(),
    });
    const { StoresList } = await import('@/app/stores/stores-list');
    const { container } = render(<StoresList />);
    expect(screen.getByText('Logo Store')).toBeInTheDocument();
    const logos = container.querySelectorAll('img[alt="Logo Store"]');
    expect(logos.length).toBeGreaterThan(0);
  });

  it('should render store without logo using accentColor', async () => {
    vi.mocked(useStores).mockReturnValue({
      stores: [
        { _id: 's1', storeName: 'Color Store', slug: 'color-store', status: 'Approved', accentColor: '#ff0000' },
      ] as any,
      isLoading: false, error: null, total: 1, page: 1, totalPages: 1, refetch: vi.fn(),
    });
    const { StoresList } = await import('@/app/stores/stores-list');
    render(<StoresList />);
    expect(screen.getByText('Color Store')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
  });

  it('should render rejected/danger badge for non-approved non-pending status', async () => {
    vi.mocked(useStores).mockReturnValue({
      stores: [
        { _id: 's1', storeName: 'Rejected Store', slug: 'rejected', status: 'Rejected' },
      ] as any,
      isLoading: false, error: null, total: 1, page: 1, totalPages: 1, refetch: vi.fn(),
    });
    const { StoresList } = await import('@/app/stores/stores-list');
    render(<StoresList />);
    expect(screen.getByText('Rejected')).toBeInTheDocument();
  });

  it('should call refetch when retry button clicked', async () => {
    const refetch = vi.fn();
    vi.mocked(useStores).mockReturnValue({
      stores: [], isLoading: false, error: 'Network error', total: 0, page: 1, totalPages: 0, refetch,
    });
    const { StoresList } = await import('@/app/stores/stores-list');
    render(<StoresList />);
    const retryBtn = screen.getByText('Reintentar');
    retryBtn.click();
    expect(refetch).toHaveBeenCalled();
  });

  it('should render store with no description', async () => {
    vi.mocked(useStores).mockReturnValue({
      stores: [
        { _id: 's1', storeName: 'No Desc', slug: 'no-desc', status: 'Approved' },
      ] as any,
      isLoading: false, error: null, total: 1, page: 1, totalPages: 1, refetch: vi.fn(),
    });
    const { StoresList } = await import('@/app/stores/stores-list');
    render(<StoresList />);
    expect(screen.getByText('No Desc')).toBeInTheDocument();
  });

  it('should handle store with fallback id for slug', async () => {
    vi.mocked(useStores).mockReturnValue({
      stores: [
        { _id: 'fallback-id', storeName: 'Fallback', status: 'Approved' },
      ] as any,
      isLoading: false, error: null, total: 1, page: 1, totalPages: 1, refetch: vi.fn(),
    });
    const { StoresList } = await import('@/app/stores/stores-list');
    const { container } = render(<StoresList />);
    const link = container.querySelector('a[href="/stores/fallback-id"]');
    expect(link).toBeInTheDocument();
  });
});
