'use client';

import { useCallback, useEffect, useState } from 'react';

import { speak, stopSpeaking, isSpeechSupported } from '@/lib/speech';
import type { SpeechConfig } from '@/types/speech';

interface UseSpeechReturn {
  speak: (text: string) => void;
  stop: () => void;
  isSupported: boolean;
}

/**
 * React hook wrapping speech synthesis with child-friendly defaults.
 * Checks browser support on mount and provides memoized speak/stop functions.
 *
 * @param config - Optional partial config to override child-friendly defaults
 */
export function useSpeech(config?: Partial<SpeechConfig>): UseSpeechReturn {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(isSpeechSupported());
  }, []);

  const speakText = useCallback(
    (text: string) => {
      speak(text, config);
    },
    [config],
  );

  const stop = useCallback(() => {
    stopSpeaking();
  }, []);

  return { speak: speakText, stop, isSupported };
}
