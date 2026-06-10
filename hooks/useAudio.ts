'use client';

import { useCallback, useEffect, useRef } from 'react';

const CELEBRATION_SOUND_PATH = '/sounds/celebration.mp3';
const ENCOURAGEMENT_SOUND_PATH = '/sounds/encouragement.mp3';

interface UseAudioReturn {
  playCelebration: () => void;
  playEncouragement: () => void;
}

/**
 * React hook for playing sound effects (celebration and encouragement).
 * Uses HTML5 Audio API with graceful error handling when audio is unavailable.
 * Audio instances are reused via refs and preloaded on mount when possible.
 */
export function useAudio(): UseAudioReturn {
  const celebrationRef = useRef<HTMLAudioElement | null>(null);
  const encouragementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    try {
      celebrationRef.current = new Audio(CELEBRATION_SOUND_PATH);
      celebrationRef.current.preload = 'auto';

      encouragementRef.current = new Audio(ENCOURAGEMENT_SOUND_PATH);
      encouragementRef.current.preload = 'auto';
    } catch {
      // Audio API may not be available in some environments (e.g., SSR, restricted browsers)
      celebrationRef.current = null;
      encouragementRef.current = null;
    }

    return () => {
      celebrationRef.current = null;
      encouragementRef.current = null;
    };
  }, []);

  const playCelebration = useCallback(() => {
    try {
      const audio = celebrationRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {
          // Gracefully ignore play errors (e.g., user hasn't interacted yet, device muted)
        });
      }
    } catch {
      // Fail silently - visual feedback still works without audio
    }
  }, []);

  const playEncouragement = useCallback(() => {
    try {
      const audio = encouragementRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {
          // Gracefully ignore play errors (e.g., user hasn't interacted yet, device muted)
        });
      }
    } catch {
      // Fail silently - visual feedback still works without audio
    }
  }, []);

  return { playCelebration, playEncouragement };
}
