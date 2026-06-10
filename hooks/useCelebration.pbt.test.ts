import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';

import { useCelebration } from './useCelebration';
import { ENCOURAGEMENT_MESSAGES } from '@/lib/constants';

// Mock useAudio since it depends on browser Audio API (not mocking randomPick)
vi.mock('./useAudio', () => ({
  useAudio: () => ({
    playCelebration: vi.fn(),
    playEncouragement: vi.fn(),
  }),
}));

/**
 * Property-based test for useCelebration hook.
 * Validates: Requirements 9.3
 *
 * FOR ALL correct answers:
 *   getEncouragingMessage() IN ["Great job!", "Awesome!", "Well done!", "Fantastic!"]
 */
describe('useCelebration - property-based tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('message is always from the valid ENCOURAGEMENT_MESSAGES set', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1000 }),
        (_seed) => {
          const { result } = renderHook(() => useCelebration());

          act(() => {
            result.current.celebrate();
          });

          expect(result.current.message).not.toBeNull();
          expect(
            (ENCOURAGEMENT_MESSAGES as readonly string[]).includes(result.current.message!)
          ).toBe(true);

          // Dismiss to clean up timer
          act(() => {
            result.current.dismiss();
          });
        }
      ),
      { numRuns: 200 }
    );
  });
});
