import { Sticker, StickerCategory } from '@/types/sticker';
import { randomPick } from '@/lib/random';
import { ALL_STICKERS, StickerDefinition } from './sticker-data';

/**
 * Awards a random sticker based on the child's current collection.
 *
 * Logic:
 * 1. Find categories that still have unearned stickers.
 * 2. If any exist, pick a random category from those, then a random unearned sticker from it.
 * 3. If all stickers are earned, pick any random sticker as a duplicate.
 *
 * @param collectedStickers - The stickers the child has already earned.
 * @returns A new Sticker object with earnedAt set to the current timestamp.
 */
export function awardSticker(collectedStickers: Sticker[]): Sticker {
  const earnedIds = new Set(collectedStickers.map((s) => s.id));

  // Find stickers not yet earned, grouped by category
  const unearnedByCategory = new Map<StickerCategory, StickerDefinition[]>();

  for (const sticker of ALL_STICKERS) {
    if (!earnedIds.has(sticker.id)) {
      const list = unearnedByCategory.get(sticker.category) || [];
      list.push(sticker);
      unearnedByCategory.set(sticker.category, list);
    }
  }

  let chosen: StickerDefinition;

  if (unearnedByCategory.size > 0) {
    // Pick a random category that still has unearned stickers
    const availableCategories = Array.from(unearnedByCategory.keys());
    const category = randomPick(availableCategories);
    const unearnedInCategory = unearnedByCategory.get(category)!;
    chosen = randomPick(unearnedInCategory);
  } else {
    // All stickers earned — award a random duplicate
    chosen = randomPick(ALL_STICKERS);
  }

  return {
    id: chosen.id,
    name: chosen.name,
    category: chosen.category,
    imageUrl: chosen.emoji,
    earnedAt: new Date().toISOString(),
  };
}
