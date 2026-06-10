import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: React.ComponentProps<'a'> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import Home from './page';

describe('Home', () => {
  it('renders exactly four navigation cards', () => {
    render(<Home />);

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(4);
  });

  it('renders cards with correct labels', () => {
    render(<Home />);

    expect(screen.getByLabelText('Math')).toBeInTheDocument();
    expect(screen.getByLabelText('English')).toBeInTheDocument();
    expect(screen.getByLabelText('Sticker Book')).toBeInTheDocument();
    expect(screen.getByLabelText('Parent Dashboard')).toBeInTheDocument();
  });

  it('renders cards with correct hrefs', () => {
    render(<Home />);

    expect(screen.getByLabelText('Math')).toHaveAttribute('href', '/math');
    expect(screen.getByLabelText('English')).toHaveAttribute('href', '/english');
    expect(screen.getByLabelText('Sticker Book')).toHaveAttribute('href', '/sticker-book');
    expect(screen.getByLabelText('Parent Dashboard')).toHaveAttribute('href', '/parent-dashboard');
  });
});
