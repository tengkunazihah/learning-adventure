'use client';

import { useState, useCallback } from 'react';
import type { Sticker } from '@/types/sticker';
import { awardSticker } from '@/features/rewards/sticker-engine';
import { useProgress } from '@/hooks/useProgress';

/**
 * Hook for awarding stickers upon activity completion.
 *
 * Integrates with useProgress to:
 * - Pass the child's collected stickers for deduplication
 * - Persist the awarded sticker to storage
 */
export function useSticker() {
  const { progress, addSticker } = useProgress();
  const [sticker, setSticker] = useState<Sticker | null>(null);

  const awardNewSticker = useCallback((): Sticker => {
    const newSticker = awardSticker(progress.stickersCollected);
    setSticker(newSticker);
    addSticker(newSticker);
    return newSticker;
  }, [progress.stickersCollected, addSticker]);

  return { sticker, awardNewSticker };
}
