import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

vi.mock('@/components/ui', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  LoadingScreen: ({ label = 'Cargando comunidad...' }: any) => (
    <div className="soft-pulse">
      <div className="loading-bar-container"><div className="loading-bar-indicator" /></div>
      <p>{label}</p>
    </div>
  ),
}));

describe('Loading pages', () => {
  it('should render products loading screen', async () => {
    const { default: ProductsLoading } = await import('@/app/products/loading');
    const { container } = render(<ProductsLoading />);
    expect(container.querySelector('.loading-bar-indicator')).toBeInTheDocument();
    expect(container.textContent).toContain('Cargando comunidad');
  });

  it('should render stores loading screen', async () => {
    const { default: StoresLoading } = await import('@/app/stores/loading');
    const { container } = render(<StoresLoading />);
    expect(container.querySelector('.loading-bar-indicator')).toBeInTheDocument();
  });

  it('should render dashboard products loading skeleton', async () => {
    const { default: DashboardProductsLoading } = await import('@/app/dashboard/my-store/[slug]/products/loading');
    const { container } = render(<DashboardProductsLoading />);
    const pulseElements = container.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it('should render edit product loading skeleton', async () => {
    const { default: EditProductLoading } = await import('@/app/dashboard/my-store/[slug]/products/[prodId]/edit/loading');
    const { container } = render(<EditProductLoading />);
    const pulseElements = container.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });
});
