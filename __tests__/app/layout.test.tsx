import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/font/google', () => ({
  Inter: () => ({ variable: 'inter', className: 'inter' }),
  IBM_Plex_Mono: () => ({ variable: 'ibm-plex-mono', className: 'ibm-plex-mono' }),
}));

vi.mock('./globals.css', () => ({}));

vi.mock('@/components/layout', () => ({
  Navbar: () => <nav data-testid="navbar" />,
  Footer: () => <footer data-testid="footer" />,
}));

vi.mock('@/components/chat/chat-widget-loader', () => ({
  ChatWidgetLoader: () => <div data-testid="chat-widget" />,
}));

vi.mock('@/components/ui/error-boundary', () => ({
  ErrorBoundary: ({ children }: any) => <div data-testid="error-boundary">{children}</div>,
}));

describe('RootLayout', () => {
  it('should render children', async () => {
    const { default: RootLayout } = await import('@/app/layout');
    render(
      <RootLayout>
        <div data-testid="child">Hello</div>
      </RootLayout>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should render Navbar, Footer and ChatWidget', async () => {
    const { default: RootLayout } = await import('@/app/layout');
    render(
      <RootLayout>
        <div>Content</div>
      </RootLayout>
    );
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByTestId('chat-widget')).toBeInTheDocument();
  });

  it('should wrap children in ErrorBoundary', async () => {
    const { default: RootLayout } = await import('@/app/layout');
    render(
      <RootLayout>
        <div data-testid="child">Hello</div>
      </RootLayout>
    );
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
  });
});
