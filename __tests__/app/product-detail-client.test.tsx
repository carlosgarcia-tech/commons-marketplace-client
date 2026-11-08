import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

vi.mock('@/hooks/use-products', () => ({
  useProduct: vi.fn(),
}));

vi.mock('@/hooks/use-auth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/app/products/[slug]/reviews-list', () => ({
  ReviewsSection: () => <div data-testid="reviews">Reviews</div>,
}));

vi.mock('@/components/ui', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  Badge: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  Spinner: () => <div data-testid="spinner" />,
  Skeleton: (props: any) => <div data-testid="skeleton" {...props} />,
}));

import { useProduct } from '@/hooks/use-products';
import { useAuth } from '@/hooks/use-auth';
import { ProductDetailClient } from '@/app/products/[slug]/product-detail-client';

const mockProduct = {
  _id: 'p1',
  name: 'Test Product',
  price: 99.99,
  status: 'Active',
  mainImageUrl: '/img.jpg',
  description: 'Desc',
  stock: 10,
  category: { _id: 'c1', name: 'Tech' },
  store: { _id: 's1', storeName: 'Store', slug: 'store' },
  sellerId: 'seller-123',
  imageUrls: ['/img2.jpg'],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ProductDetailClient', () => {
  it('should show loading skeletons', () => {
    vi.mocked(useProduct).mockReturnValue({
      product: null, isLoading: true, error: null,
    });
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false, user: null,
    });
    const { container } = render(<ProductDetailClient productId="p1" />);
    const skeletons = container.querySelectorAll('[data-testid="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should show product with multiple images and navigation arrows', () => {
    vi.mocked(useProduct).mockReturnValue({
      product: mockProduct, isLoading: false, error: null,
    });
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false, user: null,
    });
    render(<ProductDetailClient productId="p1" />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('Desc')).toBeInTheDocument();
    const navButtons = screen.getAllByText(/‹|›/);
    expect(navButtons.length).toBeGreaterThanOrEqual(2);
  });

  it('should show "Contactar Vendedor" and "Agregar al Carrito" for authenticated user', () => {
    vi.mocked(useProduct).mockReturnValue({
      product: mockProduct, isLoading: false, error: null,
    });
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { _id: 'user-999' },
    });
    render(<ProductDetailClient productId="p1" />);
    expect(screen.getByText('Contactar vendedor')).toBeInTheDocument();
    expect(screen.getByText('Agregar al carrito')).toBeInTheDocument();
  });

  it('should not show action buttons for unauthenticated user', () => {
    vi.mocked(useProduct).mockReturnValue({
      product: mockProduct, isLoading: false, error: null,
    });
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false, user: null,
    });
    render(<ProductDetailClient productId="p1" />);
    expect(screen.queryByText('Contactar vendedor')).not.toBeInTheDocument();
    expect(screen.queryByText('Agregar al carrito')).not.toBeInTheDocument();
  });

  it('should show category and store links', () => {
    vi.mocked(useProduct).mockReturnValue({
      product: mockProduct, isLoading: false, error: null,
    });
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false, user: null,
    });
    render(<ProductDetailClient productId="p1" />);
    expect(screen.getByText('Tech')).toBeInTheDocument();
    expect(screen.getByText('Store')).toBeInTheDocument();
    const categoryLink = screen.getByText('Tech').closest('a');
    expect(categoryLink).toHaveAttribute('href', '/products?category=c1');
    const storeLink = screen.getByText('Store').closest('a');
    expect(storeLink).toHaveAttribute('href', '/stores/store');
  });

  it('should show reviews section', () => {
    vi.mocked(useProduct).mockReturnValue({
      product: mockProduct, isLoading: false, error: null,
    });
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false, user: null,
    });
    render(<ProductDetailClient productId="p1" />);
    expect(screen.getByTestId('reviews')).toBeInTheDocument();
  });

  it('should not show "Contactar Vendedor" when user is the seller', () => {
    vi.mocked(useProduct).mockReturnValue({
      product: mockProduct, isLoading: false, error: null,
    });
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { _id: 'seller-123' },
    });
    render(<ProductDetailClient productId="p1" />);
    expect(screen.queryByText('Contactar vendedor')).not.toBeInTheDocument();
    expect(screen.getByText('Agregar al carrito')).toBeInTheDocument();
  });

  it('should show back link to products', () => {
    vi.mocked(useProduct).mockReturnValue({
      product: mockProduct, isLoading: false, error: null,
    });
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false, user: null,
    });
    render(<ProductDetailClient productId="p1" />);
    const backLink = screen.getByText('Volver a productos').closest('a');
    expect(backLink).toHaveAttribute('href', '/products');
  });

  it('should show stock information', () => {
    vi.mocked(useProduct).mockReturnValue({
      product: mockProduct, isLoading: false, error: null,
    });
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false, user: null,
    });
    render(<ProductDetailClient productId="p1" />);
    expect(screen.getByText(/Stock disponible: 10/)).toBeInTheDocument();
  });
});
