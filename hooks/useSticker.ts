'use client';

import { useState, useCallback } from 'react';
import type { Sticker } from '@/types/sticker';
import { awardSticker } from '@/features/rewards/sticker-engine';

/**
 * Hook for awarding stickers upon activity completion.
 *
 * Currently awards stickers with an empty collection (no deduplication).
 * TODO: Integrate with useProgress when available (Task 16) to pass
 * the child's actual collected stickers for proper deduplication logic.
 */
export function useSticker() {
  const [sticker, setSticker] = useState<Sticker | null>(null);

  const awardNewSticker = useCallback((): Sticker => {
    // Pass empty array for now — will connect to progress context later
    const newSticker = awardSticker([]);
    setSticker(newSticker);
    return newSticker;
  }, []);

  return { sticker, awardNewSticker };
}
