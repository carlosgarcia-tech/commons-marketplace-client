import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui';

describe('Card', () => {
  it('should render children', () => {
    render(<Card><p>Card content</p></Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('should apply glass material class', () => {
    const { container } = render(<Card><p>Content</p></Card>);
    expect(container.firstChild).toHaveClass('glass');
  });

  it('should add cursor-pointer when hoverable', () => {
    const { container } = render(<Card hoverable><p>Content</p></Card>);
    expect(container.firstChild).toHaveClass('cursor-pointer');
  });
});

describe('CardHeader', () => {
  it('should render children', () => {
    render(<CardHeader><h2>Title</h2></CardHeader>);
    expect(screen.getByText('Title')).toBeInTheDocument();
  });
});

describe('CardContent', () => {
  it('should render children', () => {
    render(<CardContent><p>Body</p></CardContent>);
    expect(screen.getByText('Body')).toBeInTheDocument();
  });
});

describe('CardFooter', () => {
  it('should render children', () => {
    render(<CardFooter><button>Action</button></CardFooter>);
    expect(screen.getByText('Action')).toBeInTheDocument();
  });
});
