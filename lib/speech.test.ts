import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';

import { isSpeechSupported, speak, stopSpeaking } from './speech';
import { useSpeech } from '@/hooks/useSpeech';

describe('speech utilities - synthesis unavailable', () => {
  let originalSpeechSynthesis: SpeechSynthesis | undefined;

  beforeEach(() => {
    originalSpeechSynthesis = window.speechSynthesis;
    // Set speechSynthesis to undefined to simulate unavailability
    Object.defineProperty(window, 'speechSynthesis', {
      value: undefined,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'speechSynthesis', {
      value: originalSpeechSynthesis,
      writable: true,
      configurable: true,
    });
  });

  it('isSpeechSupported returns false when speechSynthesis is unavailable', () => {
    expect(isSpeechSupported()).toBe(false);
  });

  it('speak does not throw when speech synthesis is unavailable', () => {
    expect(() => speak('Hello kids')).not.toThrow();
  });

  it('speak does not throw with custom config when synthesis is unavailable', () => {
    expect(() => speak('Hello', { rate: 0.9, pitch: 1.2, volume: 0.8 })).not.toThrow();
  });

  it('stopSpeaking does not throw when speech synthesis is unavailable', () => {
    expect(() => stopSpeaking()).not.toThrow();
  });
});

describe('speech utilities - synthesis available', () => {
  let mockCancel: ReturnType<typeof vi.fn>;
  let mockSpeak: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockCancel = vi.fn();
    mockSpeak = vi.fn();

    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        cancel: mockCancel,
        speak: mockSpeak,
      },
      writable: true,
      configurable: true,
    });

    // Mock SpeechSynthesisUtterance since jsdom doesn't provide it
    globalThis.SpeechSynthesisUtterance = class {
      text: string;
      rate = 1;
      pitch = 1;
      volume = 1;
      constructor(text: string) {
        this.text = text;
      }
    } as unknown as typeof SpeechSynthesisUtterance;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('isSpeechSupported returns true when speechSynthesis is available', () => {
    expect(isSpeechSupported()).toBe(true);
  });

  it('speak calls speechSynthesis.speak when available', () => {
    speak('Count the animals');
    expect(mockCancel).toHaveBeenCalled();
    expect(mockSpeak).toHaveBeenCalled();
  });

  it('stopSpeaking calls speechSynthesis.cancel when available', () => {
    stopSpeaking();
    expect(mockCancel).toHaveBeenCalled();
  });
});

describe('useSpeech hook - synthesis unavailable', () => {
  let originalSpeechSynthesis: SpeechSynthesis | undefined;

  beforeEach(() => {
    originalSpeechSynthesis = window.speechSynthesis;
    Object.defineProperty(window, 'speechSynthesis', {
      value: undefined,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'speechSynthesis', {
      value: originalSpeechSynthesis,
      writable: true,
      configurable: true,
    });
  });

  it('isSupported is false when speech synthesis is unavailable', () => {
    const { result } = renderHook(() => useSpeech());
    expect(result.current.isSupported).toBe(false);
  });

  it('speak does not throw when speech synthesis is unavailable', () => {
    const { result } = renderHook(() => useSpeech());
    expect(() => result.current.speak('Hello')).not.toThrow();
  });
});
