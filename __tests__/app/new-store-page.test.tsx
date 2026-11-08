import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, back: vi.fn(), refresh: vi.fn() }),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

vi.mock('@/store/auth-store', () => ({
  useAuthStore: Object.assign(vi.fn(() => ({ user: { id: '1', name: 'Test', role: 'seller' }, isAuthenticated: true, isLoading: false })), {
    getState: vi.fn(() => ({ user: { id: '1', name: 'Test', role: 'seller' }, isAuthenticated: true, isLoading: false })),
    setState: vi.fn(),
  }),
}));

vi.mock('@/store/wishlist-store', () => ({
  useWishlistStore: Object.assign(vi.fn(() => ({ items: [] })), {
    getState: vi.fn(() => ({ items: [] })),
    setState: vi.fn(),
  }),
}));

const mockCreate = vi.fn();
vi.mock('@/lib/api', () => ({
  storeApi: { create: mockCreate },
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockCreate.mockResolvedValue({});
});

describe('NewStorePage', () => {
  it('debería renderizar el formulario con los campos requeridos', async () => {
    const { default: NewStorePage } = await import('@/app/dashboard/new-store/page');
    render(<NewStorePage />);

    expect(screen.getByRole('heading', { name: /crear tienda/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre de la tienda/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /crear tienda/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
  });

  it('debería mostrar errores de validación para nombre vacío', async () => {
    const { default: NewStorePage } = await import('@/app/dashboard/new-store/page');
    render(<NewStorePage />);

    // Pointer-based clicks are flaky in jsdom for this layout; submit directly.
    fireEvent.submit(document.querySelector('form')!);
    await waitFor(() => {
      expect(screen.getByText('El nombre de la tienda es requerido')).toBeInTheDocument();
    });
  });

  it('debería enviar el formulario y redirigir', async () => {
    const { default: NewStorePage } = await import('@/app/dashboard/new-store/page');
    const user = userEvent.setup();
    render(<NewStorePage />);

    await user.type(screen.getByLabelText(/nombre de la tienda/i), 'Mi Tienda');
    await user.type(screen.getByLabelText(/descripción/i), 'Una tienda de prueba');
    await user.click(screen.getByRole('button', { name: /crear tienda/i }));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });
});
