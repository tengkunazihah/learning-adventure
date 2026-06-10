import React from 'react';
import type { Sticker } from '@/types/sticker';
import { StickerCard } from './StickerCard';

export interface StickerGridProps {
  /** Array of stickers to display in the grid */
  stickers: Sticker[];
  /** Optional title to show above the grid (e.g. category name) */
  title?: string;
}

/**
 * Renders an optional title and a responsive grid of StickerCard components.
 * Displays 3-4 columns on landscape viewports.
 */
export function StickerGrid({ stickers, title }: StickerGridProps) {
  return (
    <section className="flex flex-col gap-3">
      {title && (
        <h2 className="text-kid-heading font-bold text-neutral-700 capitalize">
          {title}
        </h2>
      )}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
        {stickers.map((sticker) => (
          <StickerCard key={sticker.id} sticker={sticker} />
        ))}
      </div>
    </section>
  );
}
