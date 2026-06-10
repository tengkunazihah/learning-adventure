import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { useAudio } from './useAudio';

describe('useAudio', () => {
  let mockPlay: ReturnType<typeof vi.fn>;
  let audioInstances: Array<{ play: typeof mockPlay; preload: string; currentTime: number }>;

  beforeEach(() => {
    mockPlay = vi.fn().mockResolvedValue(undefined);
    audioInstances = [];

    // Use class-based mock as vitest requires
    const MockAudio = vi.fn().mockImplementation(function (this: unknown) {
      const instance = {
        play: mockPlay,
        preload: '',
        currentTime: 0,
      };
      audioInstances.push(instance);
      return instance;
    }) as unknown as typeof Audio;

    globalThis.Audio = MockAudio;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns playCelebration and playEncouragement functions', () => {
    const { result } = renderHook(() => useAudio());

    expect(result.current.playCelebration).toBeTypeOf('function');
    expect(result.current.playEncouragement).toBeTypeOf('function');
  });

  it('preloads audio on mount', () => {
    renderHook(() => useAudio());

    expect(globalThis.Audio).toHaveBeenCalledWith('/sounds/celebration.mp3');
    expect(globalThis.Audio).toHaveBeenCalledWith('/sounds/encouragement.mp3');
  });

  it('plays celebration sound when playCelebration is called', () => {
    const { result } = renderHook(() => useAudio());

    act(() => {
      result.current.playCelebration();
    });

    expect(mockPlay).toHaveBeenCalled();
  });

  it('plays encouragement sound when playEncouragement is called', () => {
    const { result } = renderHook(() => useAudio());

    act(() => {
      result.current.playEncouragement();
    });

    expect(mockPlay).toHaveBeenCalled();
  });

  it('handles gracefully when Audio constructor throws', () => {
    globalThis.Audio = vi.fn().mockImplementation(() => {
      throw new Error('Audio not supported');
    }) as unknown as typeof Audio;

    const { result } = renderHook(() => useAudio());

    // Should not throw
    expect(() => {
      act(() => {
        result.current.playCelebration();
      });
    }).not.toThrow();

    expect(() => {
      act(() => {
        result.current.playEncouragement();
      });
    }).not.toThrow();
  });

  it('handles gracefully when play() rejects', () => {
    mockPlay = vi.fn().mockRejectedValue(new Error('NotAllowedError'));

    globalThis.Audio = vi.fn().mockImplementation(() => ({
      play: mockPlay,
      preload: '',
      currentTime: 0,
    })) as unknown as typeof Audio;

    const { result } = renderHook(() => useAudio());

    // Should not throw even when play() rejects
    expect(() => {
      act(() => {
        result.current.playCelebration();
      });
    }).not.toThrow();
  });

  it('resets currentTime to 0 before playing for quick re-trigger', () => {
    const { result } = renderHook(() => useAudio());

    // Simulate time having passed (audio was partially played)
    if (audioInstances[0]) {
      audioInstances[0].currentTime = 1.5;
    }

    act(() => {
      result.current.playCelebration();
    });

    expect(audioInstances[0].currentTime).toBe(0);
  });
});
