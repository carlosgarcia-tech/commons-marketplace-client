import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Navbar } from '@/components/layout/navbar';
import { useAuthStore } from '@/store/auth-store';
import { useWishlistStore } from '@/store/wishlist-store';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/',
}));

vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });
  useWishlistStore.setState({ items: [], isLoading: false });
});

describe('Navbar', () => {
  it('should render logo and brand name', () => {
    render(<Navbar />);
    expect(screen.getByText('Commons')).toBeInTheDocument();
  });

  it('should show login/register links when not authenticated', () => {
    render(<Navbar />);
    expect(screen.getByText('Entrar')).toBeInTheDocument();
    expect(screen.getByText('Registro')).toBeInTheDocument();
  });

  it('should show user info when authenticated', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: '1', name: 'John', email: 'john@test.com', role: 'buyer' } as any,
    });
    render(<Navbar />);
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('buyer')).toBeInTheDocument();
    expect(screen.getByText('Salir')).toBeInTheDocument();
  });

  it('should show admin link for admin role', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: '1', name: 'Admin', role: 'admin' } as any,
    });
    render(<Navbar />);
    expect(screen.getByRole('link', { name: 'Admin' })).toHaveAttribute('href', '/admin');
    expect(screen.getByText('Mi Tienda')).toBeInTheDocument();
  });

  it('should show seller links for seller role', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: '1', name: 'Seller', role: 'seller' } as any,
    });
    render(<Navbar />);
    expect(screen.getByText('Mi Tienda')).toBeInTheDocument();
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });

  it('should not show auth-required links for buyers', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: '1', name: 'Buyer', role: 'buyer' } as any,
    });
    render(<Navbar />);
    expect(screen.queryByText('Mi Tienda')).not.toBeInTheDocument();
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });

  it('should always show Products and Stores links', () => {
    render(<Navbar />);
    expect(screen.getByText('Productos')).toBeInTheDocument();
    expect(screen.getByText('Tiendas')).toBeInTheDocument();
  });
});
