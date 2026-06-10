'use client';

import { useState, useCallback, useRef } from 'react';
import type { Sticker } from '@/types/sticker';
import { awardSticker } from '@/features/rewards/sticker-engine';
import { useProgress } from '@/hooks/useProgress';

/**
 * Hook for awarding stickers upon activity completion.
 *
 * Integrates with useProgress to:
 * - Pass the child's collected stickers for deduplication
 * - Persist the awarded sticker to storage
 *
 * Uses refs to keep `awardNewSticker` stable (no dependency on progress state)
 * so that calling it inside a useEffect doesn't cause re-render loops.
 */
export function useSticker() {
  const { progress, addSticker } = useProgress();
  const [sticker, setSticker] = useState<Sticker | null>(null);
  const hasAwarded = useRef(false);

  // Keep a ref to the latest collected stickers so the callback stays stable
  const collectedRef = useRef(progress.stickersCollected);
  collectedRef.current = progress.stickersCollected;

  const addStickerRef = useRef(addSticker);
  addStickerRef.current = addSticker;

  const awardNewSticker = useCallback((): Sticker | null => {
    // Prevent double-awarding in the same session (e.g. StrictMode double-fire)
    if (hasAwarded.current) return null;

    const newSticker = awardSticker(collectedRef.current);
    setSticker(newSticker);
    addStickerRef.current(newSticker);
    hasAwarded.current = true;
    return newSticker;
  }, []);

  return { sticker, awardNewSticker };
}
