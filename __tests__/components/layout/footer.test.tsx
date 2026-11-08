import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/layout/footer';

describe('Footer', () => {
  it('should render copyright text', () => {
    render(<Footer />);
    expect(screen.getByText(/2026 Commons Marketplace/)).toBeInTheDocument();
  });

  it('should render tagline', () => {
    render(<Footer />);
    expect(screen.getByText('Hecho por la comunidad que lo vende')).toBeInTheDocument();
  });

  it('should have footer element', () => {
    const { container } = render(<Footer />);
    expect(container.querySelector('footer')).toBeInTheDocument();
  });
});
