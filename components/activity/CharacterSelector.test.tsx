import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { CharacterSelector } from './CharacterSelector';

describe('CharacterSelector', () => {
  const defaultProps = {
    selectedCharacter: null as null,
    onSelect: vi.fn(),
    onStartRace: vi.fn(),
  };

  it('renders 3 character cards with emoji and label', () => {
    render(<CharacterSelector {...defaultProps} />);

    expect(screen.getByText('🦆')).toBeInTheDocument();
    expect(screen.getByText('🐼')).toBeInTheDocument();
    expect(screen.getByText('🐰')).toBeInTheDocument();

    expect(screen.getByText('Duck')).toBeInTheDocument();
    expect(screen.getByText('Panda')).toBeInTheDocument();
    expect(screen.getByText('Rabbit')).toBeInTheDocument();
  });

  it('renders character buttons with correct aria-labels', () => {
    render(<CharacterSelector {...defaultProps} />);

    expect(screen.getByRole('button', { name: 'Select Duck' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Select Panda' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Select Rabbit' })).toBeInTheDocument();
  });

  it('character cards have minimum 48x48px touch target', () => {
    render(<CharacterSelector {...defaultProps} />);

    const duckButton = screen.getByRole('button', { name: 'Select Duck' });
    // min-w-[80px] min-h-[80px] satisfies the 48x48 minimum
    expect(duckButton).toHaveClass('min-w-[80px]');
    expect(duckButton).toHaveClass('min-h-[80px]');
  });

  it('disables Start Race button when no character is selected', () => {
    render(<CharacterSelector {...defaultProps} />);

    const startButton = screen.getByRole('button', { name: /start race/i });
    expect(startButton).toBeDisabled();
  });

  it('enables Start Race button when a character is selected', () => {
    render(<CharacterSelector {...defaultProps} selectedCharacter="duck" />);

    const startButton = screen.getByRole('button', { name: /start race/i });
    expect(startButton).not.toBeDisabled();
  });

  it('calls onSelect when a character card is tapped', () => {
    const onSelect = vi.fn();
    render(<CharacterSelector {...defaultProps} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', { name: 'Select Panda' }));
    expect(onSelect).toHaveBeenCalledWith('panda');
  });

  it('highlights selected character with scale/border effect', () => {
    render(<CharacterSelector {...defaultProps} selectedCharacter="rabbit" />);

    const rabbitButton = screen.getByRole('button', { name: 'Select Rabbit' });
    expect(rabbitButton).toHaveClass('border-4');
    expect(rabbitButton).toHaveClass('scale-110');

    // Other characters should not have the selected styles
    const duckButton = screen.getByRole('button', { name: 'Select Duck' });
    expect(duckButton).toHaveClass('border-2');
    expect(duckButton).not.toHaveClass('scale-110');
  });

  it('calls onStartRace when Start Race button is clicked', () => {
    const onStartRace = vi.fn();
    render(
      <CharacterSelector {...defaultProps} selectedCharacter="duck" onStartRace={onStartRace} />
    );

    fireEvent.click(screen.getByRole('button', { name: /start race/i }));
    expect(onStartRace).toHaveBeenCalledTimes(1);
  });

  it('does not call onStartRace when button is disabled', () => {
    const onStartRace = vi.fn();
    render(<CharacterSelector {...defaultProps} onStartRace={onStartRace} />);

    fireEvent.click(screen.getByRole('button', { name: /start race/i }));
    expect(onStartRace).not.toHaveBeenCalled();
  });

  it('announces selected character via aria-live region', () => {
    const { rerender } = render(<CharacterSelector {...defaultProps} />);

    // Initially no announcement
    expect(screen.queryByText('Duck selected')).not.toBeInTheDocument();

    // After selecting duck
    rerender(<CharacterSelector {...defaultProps} selectedCharacter="duck" />);
    expect(screen.getByText('Duck selected')).toBeInTheDocument();
  });

  it('sets aria-pressed on selected character button', () => {
    render(<CharacterSelector {...defaultProps} selectedCharacter="panda" />);

    expect(screen.getByRole('button', { name: 'Select Panda' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Select Duck' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Select Rabbit' })).toHaveAttribute('aria-pressed', 'false');
  });
});
