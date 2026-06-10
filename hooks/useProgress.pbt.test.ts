import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { InMemoryAdapter } from '@/lib/storage';
import type { StorageAdapter } from '@/lib/storage';
import type { ProgressData } from '@/types/progress';
import type { ActivityType } from '@/types/activity';
import type { Sticker, StickerCategory } from '@/types/sticker';
import type { ActivityRecord } from '@/types/progress';

/**
 * Property-based test: Progress data round-trip persistence.
 * Validates: Requirements 8.4, 10.7, 14.1, 14.4
 *
 * FOR ALL valid ProgressData p:
 *   storage.save('progress', p)
 *   storage.load<ProgressData>('progress') deepEquals p
 *
 * This test generates arbitrary valid ProgressData objects and verifies that
 * saving to an InMemoryAdapter (which uses the same JSON serialization as
 * LocalStorageAdapter) and then loading produces equivalent data.
 */

const STORAGE_KEY = 'learning-adventure-progress';

// ---------------------------------------------------------------------------
// Generators
// ---------------------------------------------------------------------------

const activityTypeArbitrary: fc.Arbitrary<ActivityType> = fc.constantFrom(
  'count-animals',
  'number-matching',
  'shape-hunt',
  'letter-recognition',
  'beginning-sounds',
  'first-words'
);

const stickerCategoryArbitrary: fc.Arbitrary<StickerCategory> = fc.constantFrom(
  'animals',
  'stars',
  'dinosaurs',
  'vehicles',
  'fruits'
);

const stickerArbitrary: fc.Arbitrary<Sticker> = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  name: fc.string({ minLength: 1, maxLength: 30 }),
  category: stickerCategoryArbitrary,
  imageUrl: fc.string({ minLength: 1, maxLength: 50 }),
  earnedAt: fc.constant(new Date().toISOString()),
});

const activityRecordArbitrary: fc.Arbitrary<ActivityRecord> = fc.record({
  activityType: activityTypeArbitrary,
  completedAt: fc.constant(new Date().toISOString()),
  correctAnswers: fc.integer({ min: 0, max: 5 }),
  totalQuestions: fc.constant(5),
});

const lettersArbitrary = fc.uniqueArray(
  fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')),
  { maxLength: 26 }
);

const numbersArbitrary = fc.uniqueArray(
  fc.integer({ min: 1, max: 10 }),
  { maxLength: 10 }
);

const progressDataArbitrary: fc.Arbitrary<ProgressData> = fc.record({
  activitiesCompleted: fc.nat({ max: 1000 }),
  lettersLearned: lettersArbitrary,
  numbersMastered: numbersArbitrary,
  stickersCollected: fc.array(stickerArbitrary, { maxLength: 25 }),
  lastPlayedDate: fc.constant(new Date().toISOString()),
  activityHistory: fc.array(activityRecordArbitrary, { maxLength: 50 }),
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useProgress - progress data round-trip property', () => {
  let adapter: StorageAdapter;

  beforeEach(() => {
    adapter = new InMemoryAdapter();
    adapter.clear();
  });

  it('save then load produces equivalent ProgressData for all valid progress objects', () => {
    fc.assert(
      fc.property(progressDataArbitrary, (progressData) => {
        adapter.save(STORAGE_KEY, progressData);
        const loaded = adapter.load<ProgressData>(STORAGE_KEY);
        expect(loaded).toEqual(progressData);
      }),
      { numRuns: 100 }
    );
  });
});
