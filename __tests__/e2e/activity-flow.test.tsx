import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock next/link to render a plain anchor
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: React.ComponentProps<'a'> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock useAudio to prevent actual audio playback
vi.mock('@/hooks/useAudio', () => ({
  useAudio: () => ({
    playCelebration: vi.fn(),
    playEncouragement: vi.fn(),
  }),
}));

// Mock useSpeech to prevent actual speech synthesis
vi.mock('@/hooks/useSpeech', () => ({
  useSpeech: () => ({
    speak: vi.fn(),
    stop: vi.fn(),
    isSupported: false,
  }),
}));

// Mock useSticker to provide a controlled sticker
vi.mock('@/hooks/useSticker', () => ({
  useSticker: () => ({
    sticker: { id: 'test-sticker', name: 'Test Star', category: 'stars', imageUrl: '/stickers/star.png', earnedAt: new Date().toISOString() },
    awardNewSticker: vi.fn(),
  }),
}));

import CountAnimalsPage from '@/app/math/count-animals/page';

describe('Activity Flow Integration: Home → Activity → Celebration → Sticker → Home', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('completes all 5 questions and shows completion screen with sticker and home navigation', async () => {
    render(<CountAnimalsPage />);

    // Activity should start with the first question visible
    expect(screen.getByText('Count the Animals')).toBeInTheDocument();

    // Answer all 5 questions correctly by clicking the correct answer button
    for (let i = 0; i < 5; i++) {
      // Find all answer buttons (they have role="button" and "Answer:" prefix in aria-label)
      const answerButtons = screen.getAllByRole('button', { name: /^Answer:/ });
      expect(answerButtons.length).toBe(4);

      // Find the correct answer — it matches the correct count displayed.
      // The question has a correctOptionId, but from the rendered UI we need
      // to find which button is correct. Since we can't easily determine it from
      // the DOM alone, we'll click each button until we get the correct one.
      // Actually, let's find the correct answer by looking at the animal count.
      // The animals are rendered as spans with emoji text inside a div with aria-label.
      const animalContainer = screen.getByLabelText(/\d+ \w+s/);
      const countMatch = animalContainer.getAttribute('aria-label')?.match(/^(\d+)/);
      const correctCount = countMatch ? countMatch[1] : null;

      expect(correctCount).not.toBeNull();

      // Click the button whose label text matches the correct count
      const correctButton = screen.getByRole('button', { name: `Answer: ${correctCount}` });
      await act(async () => {
        correctButton.click();
      });

      // Advance timers to allow the 800ms delay before advancing to next question
      await act(async () => {
        vi.advanceTimersByTime(900);
      });
    }

    // After all 5 correct answers, the CompletionScreen should appear
    expect(screen.getByText('Well done! 🎉')).toBeInTheDocument();
    expect(screen.getByText('You earned a sticker!')).toBeInTheDocument();
    expect(screen.getByText('Test Star')).toBeInTheDocument();

    // Verify navigation buttons are present
    const homeButton = screen.getByRole('button', { name: /Home/i });
    expect(homeButton).toBeInTheDocument();

    // Home link should point to /math (as configured in the page)
    const homeLink = homeButton.closest('a');
    expect(homeLink).toHaveAttribute('href', '/math');

    // Next activity link should also be present
    const nextActivityButton = screen.getByRole('button', { name: /Number Matching/i });
    expect(nextActivityButton).toBeInTheDocument();
    const nextLink = nextActivityButton.closest('a');
    expect(nextLink).toHaveAttribute('href', '/math/number-matching');
  });
});
