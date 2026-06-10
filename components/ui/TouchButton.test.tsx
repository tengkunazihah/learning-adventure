import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { TouchButton } from './TouchButton';

describe('TouchButton', () => {
  it('renders with min-w-touch and min-h-touch classes for 80x80px minimum dimensions', () => {
    render(<TouchButton>Tap me</TouchButton>);

    const button = screen.getByRole('button', { name: 'Tap me' });
    expect(button).toHaveClass('min-w-touch');
    expect(button).toHaveClass('min-h-touch');
  });

  it('renders as a button element with correct role', () => {
    render(<TouchButton>Click</TouchButton>);

    const button = screen.getByRole('button', { name: 'Click' });
    expect(button).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();

    render(<TouchButton onClick={handleClick}>Press</TouchButton>);

    const button = screen.getByRole('button', { name: 'Press' });
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn();

    render(
      <TouchButton onClick={handleClick} disabled>
        Disabled
      </TouchButton>
    );

    const button = screen.getByRole('button', { name: 'Disabled' });
    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
  });

  it('applies default variant styles when no variant specified', () => {
    render(<TouchButton>Default</TouchButton>);

    const button = screen.getByRole('button', { name: 'Default' });
    expect(button).toHaveClass('bg-background');
  });

  it('applies primary variant styles', () => {
    render(<TouchButton variant="primary">Primary</TouchButton>);

    const button = screen.getByRole('button', { name: 'Primary' });
    expect(button).toHaveClass('bg-primary');
    expect(button).toHaveClass('text-white');
  });

  it('applies success variant styles', () => {
    render(<TouchButton variant="success">Success</TouchButton>);

    const button = screen.getByRole('button', { name: 'Success' });
    expect(button).toHaveClass('bg-success');
    expect(button).toHaveClass('text-white');
  });
});
