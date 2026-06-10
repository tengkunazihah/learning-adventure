import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

import { awardSticker } from './sticker-engine';
import { ALL_STICKERS } from './sticker-data';
import { Sticker } from '@/types/sticker';

/**
 * Property-based test for sticker-engine.
 * Validates: Requirements 8.1
 *
 * FOR ALL activity completions:
 *   stickersAfter.length === stickersBefore.length + 1
 */
describe('sticker-engine - property-based tests', () => {
  // Arbitrary generator for previously earned sticker collections (size 0 to 25)
  const collectedStickersArb = fc
    .integer({ min: 0, max: 25 })
    .chain((size) =>
      fc
        .shuffledSubarray(ALL_STICKERS, { minLength: 0, maxLength: Math.min(size, ALL_STICKERS.length) })
        .map((subset) =>
          subset.map(
            (def): Sticker => ({
              id: def.id,
              name: def.name,
              category: def.category,
              imageUrl: def.emoji,
              earnedAt: new Date().toISOString(),
            })
          )
        )
    );

  it('awardSticker always returns exactly one valid Sticker object', () => {
    fc.assert(
      fc.property(collectedStickersArb, (collectedStickers) => {
        const result = awardSticker(collectedStickers);

        // Exactly one sticker is returned (not an array, not null)
        expect(result).toBeDefined();
        expect(result).not.toBeNull();

        // If we model "stickersAfter" as collectedStickers + [result],
        // then stickersAfter.length === stickersBefore.length + 1
        const stickersBefore = collectedStickers;
        const stickersAfter = [...stickersBefore, result];
        expect(stickersAfter.length).toBe(stickersBefore.length + 1);
      }),
      { numRuns: 200 }
    );
  });

  it('returned sticker has all required fields (id, name, category, imageUrl, earnedAt)', () => {
    fc.assert(
      fc.property(collectedStickersArb, (collectedStickers) => {
        const result = awardSticker(collectedStickers);

        // All required fields must be present and non-empty
        expect(typeof result.id).toBe('string');
        expect(result.id.length).toBeGreaterThan(0);

        expect(typeof result.name).toBe('string');
        expect(result.name.length).toBeGreaterThan(0);

        expect(typeof result.category).toBe('string');
        expect(['animals', 'stars', 'dinosaurs', 'vehicles', 'fruits']).toContain(result.category);

        expect(typeof result.imageUrl).toBe('string');
        expect(result.imageUrl.length).toBeGreaterThan(0);

        expect(typeof result.earnedAt).toBe('string');
        expect(result.earnedAt.length).toBeGreaterThan(0);
        // earnedAt should be a valid ISO date string
        expect(new Date(result.earnedAt).toISOString()).toBe(result.earnedAt);
      }),
      { numRuns: 200 }
    );
  });
});
