import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { useCelebration } from './useCelebration';

// Mock useAudio
vi.mock('./useAudio', () => ({
  useAudio: () => ({
    playCelebration: vi.fn(),
    playEncouragement: vi.fn(),
  }),
}));

// Mock randomPick to return a predictable value
vi.mock('@/lib/random', () => ({
  randomPick: (arr: string[]) => arr[0],
}));

describe('useCelebration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('returns celebrate, isActive, message, and dismiss', () => {
    const { result } = renderHook(() => useCelebration());

    expect(result.current.celebrate).toBeTypeOf('function');
    expect(result.current.dismiss).toBeTypeOf('function');
    expect(result.current.isActive).toBe(false);
    expect(result.current.message).toBeNull();
  });

  it('starts inactive with null message', () => {
    const { result } = renderHook(() => useCelebration());

    expect(result.current.isActive).toBe(false);
    expect(result.current.message).toBeNull();
  });

  it('sets isActive to true and picks a message when celebrate is called', () => {
    const { result } = renderHook(() => useCelebration());

    act(() => {
      result.current.celebrate();
    });

    expect(result.current.isActive).toBe(true);
    expect(result.current.message).toBe('Great job!');
  });

  it('auto-dismisses after ~2500ms', () => {
    const { result } = renderHook(() => useCelebration());

    act(() => {
      result.current.celebrate();
    });

    expect(result.current.isActive).toBe(true);

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(result.current.isActive).toBe(false);
    expect(result.current.message).toBeNull();
  });

  it('allows manual dismiss before auto-dismiss', () => {
    const { result } = renderHook(() => useCelebration());

    act(() => {
      result.current.celebrate();
    });

    expect(result.current.isActive).toBe(true);

    act(() => {
      result.current.dismiss();
    });

    expect(result.current.isActive).toBe(false);
    expect(result.current.message).toBeNull();
  });

  it('resets timer when celebrate is called again during active celebration', () => {
    const { result } = renderHook(() => useCelebration());

    act(() => {
      result.current.celebrate();
    });

    // Advance partially
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(result.current.isActive).toBe(true);

    // Trigger again
    act(() => {
      result.current.celebrate();
    });

    // After another 1500ms, still active (timer was reset)
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(result.current.isActive).toBe(true);

    // After full duration from second celebrate, should dismiss
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.isActive).toBe(false);
  });
});
