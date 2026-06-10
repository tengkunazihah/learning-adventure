/**
 * Speech synthesis utilities for child-friendly text-to-speech.
 * Wraps the Web Speech API with defaults suited for a young audience
 * and provides SSR-safe checks for browser availability.
 */

import type { SpeechConfig } from '@/types/speech';

/**
 * Default speech configuration optimized for children aged 4-5.
 * - rate: 0.8 for a slower, easier-to-follow pace
 * - pitch: 1.1 for a friendly, slightly higher tone
 * - volume: 1.0 for full volume
 */
export const DEFAULT_SPEECH_CONFIG: SpeechConfig = {
  rate: 0.8,
  pitch: 1.1,
  volume: 1.0,
};

/**
 * Checks whether the browser supports the Web Speech Synthesis API.
 * Returns false in SSR environments or browsers without support.
 */
export function isSpeechSupported(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return 'speechSynthesis' in window && window.speechSynthesis != null;
}

/**
 * Speaks the given text using the Web Speech Synthesis API.
 * Cancels any ongoing speech before starting new speech.
 * Falls back gracefully (no-op) if speech synthesis is unavailable.
 *
 * @param text - The text to speak aloud
 * @param config - Optional partial config to override defaults
 */
export function speak(text: string, config?: Partial<SpeechConfig>): void {
  if (!isSpeechSupported()) {
    return;
  }

  const mergedConfig: SpeechConfig = { ...DEFAULT_SPEECH_CONFIG, ...config };

  // Cancel any ongoing speech before starting new speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = mergedConfig.rate;
  utterance.pitch = mergedConfig.pitch;
  utterance.volume = mergedConfig.volume;

  window.speechSynthesis.speak(utterance);
}

/**
 * Stops any currently playing speech synthesis.
 * Falls back gracefully (no-op) if speech synthesis is unavailable.
 */
export function stopSpeaking(): void {
  if (!isSpeechSupported()) {
    return;
  }

  window.speechSynthesis.cancel();
}
