'use client';

import React from 'react';
import { BackButton } from '@/components/ui/BackButton';
import { StickerGrid } from '@/components/rewards/StickerGrid';
import type { Sticker, StickerCategory } from '@/types/sticker';

/**
 * Sticker Book page displaying all collected stickers organized by category.
 *
 * TODO: Replace the empty array with data from useProgress hook once Task 16
 * (Progress Management) is implemented.
 */
export default function StickerBookPage() {
  // TODO: Use useProgress() hook to get collected stickers once available
  const collectedStickers: Sticker[] = [];

  // Group stickers by category
  const stickersByCategory = collectedStickers.reduce<
    Record<StickerCategory, Sticker[]>
  >(
    (groups, sticker) => {
      groups[sticker.category].push(sticker);
      return groups;
    },
    {
      animals: [],
      stars: [],
      dinosaurs: [],
      vehicles: [],
      fruits: [],
    }
  );

  const categories = Object.entries(stickersByCategory).filter(
    ([, stickers]) => stickers.length > 0
  );

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        <div className="flex items-center gap-4">
          <BackButton href="/" label="Home" />
          <h1 className="text-kid-large font-bold text-primary">
            Sticker Book
          </h1>
        </div>

        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <span className="text-7xl" role="img" aria-label="empty book">
              📖
            </span>
            <p className="text-kid-heading font-bold text-neutral-600 text-center">
              No stickers yet!
            </p>
            <p className="text-kid-body text-neutral-500 text-center max-w-md">
              Complete activities to earn stickers. Each time you finish, you get
              a fun new sticker for your book!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {categories.map(([category, stickers]) => (
              <StickerGrid
                key={category}
                title={category}
                stickers={stickers}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
