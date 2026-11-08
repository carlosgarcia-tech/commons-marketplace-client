import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

vi.mock('@/hooks/use-products', () => ({
  useProducts: vi.fn(),
}));

vi.mock('@/app/products/product-card', () => ({
  ProductCard: ({ product }: any) => <div data-testid="product-card">{product.name}</div>,
}));

vi.mock('@/components/ui', () => ({
  Button: ({ children, onClick, ...props }: any) => <button onClick={onClick} {...props}>{children}</button>,
  Skeleton: ({ className }: any) => <div className={className} data-testid="skeleton" />,
}));

import { useProducts } from '@/hooks/use-products';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ProductsList', () => {
  it('should show loading skeletons', async () => {
    vi.mocked(useProducts).mockReturnValue({
      products: [], isLoading: true, error: null, total: 0, page: 1, totalPages: 0, refetch: vi.fn(),
    });
    const { ProductsList } = await import('@/app/products/products-list');
    const { container } = render(<ProductsList />);
    expect(container.querySelectorAll('[data-testid="skeleton"]').length).toBeGreaterThan(0);
  });

  it('should show error state with retry button', async () => {
    vi.mocked(useProducts).mockReturnValue({
      products: [], isLoading: false, error: 'Network error', total: 0, page: 1, totalPages: 0, refetch: vi.fn(),
    });
    const { ProductsList } = await import('@/app/products/products-list');
    render(<ProductsList />);
    expect(screen.getByText('Network error')).toBeInTheDocument();
    expect(screen.getByText('Reintentar')).toBeInTheDocument();
  });

  it('should show empty state message', async () => {
    vi.mocked(useProducts).mockReturnValue({
      products: [], isLoading: false, error: null, total: 0, page: 1, totalPages: 0, refetch: vi.fn(),
    });
    const { ProductsList } = await import('@/app/products/products-list');
    render(<ProductsList />);
    expect(screen.getByText(/No se encontraron productos/)).toBeInTheDocument();
  });

  it('should render products list', async () => {
    vi.mocked(useProducts).mockReturnValue({
      products: [
        { _id: 'p1', name: 'Product One', price: 10, stock: 5 },
        { _id: 'p2', name: 'Product Two', price: 20, stock: 3 },
      ] as any,
      isLoading: false, error: null, total: 2, page: 1, totalPages: 1, refetch: vi.fn(),
    });
    const { ProductsList } = await import('@/app/products/products-list');
    render(<ProductsList />);
    expect(screen.getByText('Product One')).toBeInTheDocument();
    expect(screen.getByText('Product Two')).toBeInTheDocument();
    expect(screen.getByText('2 productos encontrados')).toBeInTheDocument();
  });

  it('should render pagination when totalPages > 1', async () => {
    vi.mocked(useProducts).mockReturnValue({
      products: [
        { _id: 'p1', name: 'Product One', price: 10, stock: 5 },
      ] as any,
      isLoading: false, error: null, total: 20, page: 1, totalPages: 2, refetch: vi.fn(),
    });
    const { ProductsList } = await import('@/app/products/products-list');
    render(<ProductsList />);
    expect(screen.getByText('Anterior')).toBeInTheDocument();
    expect(screen.getByText('Siguiente')).toBeInTheDocument();
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
  });
});
