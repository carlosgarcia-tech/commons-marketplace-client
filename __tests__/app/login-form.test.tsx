import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, back: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const mockLogin = vi.fn().mockResolvedValue(undefined);
const mockAuthState = {
  user: null as any,
  isAuthenticated: false,
  isLoading: false,
  error: null as string | null,
  login: mockLogin,
  clearError: vi.fn(),
};

vi.mock('@/store/auth-store', () => ({
  useAuthStore: Object.assign(vi.fn(() => mockAuthState), {
    getState: vi.fn(() => mockAuthState),
    setState: vi.fn(),
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockAuthState.error = null;
  mockLogin.mockResolvedValue(undefined);
});

describe('LoginForm', () => {
  it('should render form fields', async () => {
    const { LoginForm } = await import('@/app/login/login-form');
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('should validate empty email', async () => {
    const user = userEvent.setup();
    const { LoginForm } = await import('@/app/login/login-form');
    render(<LoginForm />);
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    await waitFor(() => {
      expect(screen.getByText('El email es requerido')).toBeInTheDocument();
    });
  });

  it('should validate empty password', async () => {
    const user = userEvent.setup();
    const { LoginForm } = await import('@/app/login/login-form');
    render(<LoginForm />);
    await user.type(screen.getByLabelText(/email/i), 'test@test.com');
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    await waitFor(() => {
      expect(screen.getByText('La contraseña es requerida')).toBeInTheDocument();
    });
  });

  it('should submit with valid data', async () => {
    const user = userEvent.setup();
    const { LoginForm } = await import('@/app/login/login-form');
    render(<LoginForm />);
    await user.type(screen.getByLabelText(/email/i), 'test@test.com');
    await user.type(screen.getByLabelText(/contraseña/i), 'password123');
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@test.com', 'password123');
    });
  });

  it('should display error from store', async () => {
    mockAuthState.error = 'Credenciales inválidas';
    const { LoginForm } = await import('@/app/login/login-form');
    render(<LoginForm />);
    expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
    mockAuthState.error = null;
  });

  it('should clear the password but keep the email after a failed login', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValueOnce(new Error('Credenciales inválidas'));
    const { LoginForm } = await import('@/app/login/login-form');
    render(<LoginForm />);
    await user.type(screen.getByLabelText(/email/i), 'test@test.com');
    await user.type(screen.getByLabelText(/contraseña/i), 'password123');
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    await waitFor(() => {
      expect(screen.getByLabelText(/contraseña/i)).toHaveValue('');
      expect(screen.getByLabelText(/email/i)).toHaveValue('test@test.com');
    });
  });

});
