'use client';

import { useCallback, useRef, useState } from 'react';
import { useAudio } from './useAudio';
import { ENCOURAGEMENT_MESSAGES } from '@/lib/constants';
import { randomPick } from '@/lib/random';

/** Duration in ms before auto-dismissing the celebration (≥ 2 seconds per Req 9.4) */
const CELEBRATION_DURATION_MS = 2500;

interface UseCelebrationReturn {
  /** Triggers celebration: sets active state, picks random message, plays sound */
  celebrate: () => void;
  /** Whether the celebration overlay is currently showing */
  isActive: boolean;
  /** The current encouragement message, or null when not celebrating */
  message: string | null;
  /** Manually dismiss the celebration */
  dismiss: () => void;
}

/**
 * Hook for triggering celebration effects on correct answers.
 * Combines stars animation state, encouraging message selection, and sound playback.
 * Auto-dismisses after ~2.5 seconds. If audio is unavailable, visual celebration still works.
 */
export function useCelebration(): UseCelebrationReturn {
  const [isActive, setIsActive] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { playCelebration } = useAudio();

  const dismiss = useCallback(() => {
    setIsActive(false);
    setMessage(null);
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const celebrate = useCallback(() => {
    // Clear any existing celebration timer
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }

    // Pick a random encouraging message
    const selectedMessage = randomPick(ENCOURAGEMENT_MESSAGES);

    // Activate celebration state
    setIsActive(true);
    setMessage(selectedMessage);

    // Play celebration sound (gracefully fails if audio unavailable)
    playCelebration();

    // Auto-dismiss after duration
    timerRef.current = setTimeout(() => {
      setIsActive(false);
      setMessage(null);
      timerRef.current = null;
    }, CELEBRATION_DURATION_MS);
  }, [playCelebration]);

  return { celebrate, isActive, message, dismiss };
}
