import React from 'react';
import type { Sticker } from '@/types/sticker';

export interface StickerCardProps {
  /** The sticker to display */
  sticker: Sticker;
}

/**
 * Displays an individual sticker as a small card with the emoji image
 * shown large and the sticker name below.
 */
export function StickerCard({ sticker }: StickerCardProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-2xl shadow-md">
      <span className="text-5xl" role="img" aria-label={sticker.name}>
        {sticker.imageUrl}
      </span>
      <p className="text-kid-body font-semibold text-neutral-700 text-center">
        {sticker.name}
      </p>
    </div>
  );
}
