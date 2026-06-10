import { describe, it, expect } from 'vitest';

import { computeStats } from './stats-calculator';
import type { ProgressData } from '@/types/progress';
import type { Sticker } from '@/types/sticker';

function makeSticker(id: string): Sticker {
  return {
    id,
    name: `Sticker ${id}`,
    category: 'animals',
    imageUrl: `/stickers/${id}.png`,
    earnedAt: '2024-01-15T10:00:00.000Z',
  };
}

describe('computeStats', () => {
  it('returns zeros and empty strings for default progress', () => {
    const progress: ProgressData = {
      activitiesCompleted: 0,
      lettersLearned: [],
      numbersMastered: [],
      stickersCollected: [],
      lastPlayedDate: '',
      activityHistory: [],
    };

    const stats = computeStats(progress);

    expect(stats.activitiesCompleted).toBe(0);
    expect(stats.lettersLearned).toBe(0);
    expect(stats.numbersMastered).toBe(0);
    expect(stats.stickersCollected).toBe(0);
    expect(stats.lastPlayedDate).toBe('');
  });

  it('correctly counts letters learned', () => {
    const progress: ProgressData = {
      activitiesCompleted: 5,
      lettersLearned: ['A', 'B', 'C', 'D', 'E'],
      numbersMastered: [],
      stickersCollected: [],
      lastPlayedDate: '2024-06-15T14:30:00.000Z',
      activityHistory: [],
    };

    const stats = computeStats(progress);

    expect(stats.lettersLearned).toBe(5);
  });

  it('correctly counts numbers mastered', () => {
    const progress: ProgressData = {
      activitiesCompleted: 3,
      lettersLearned: [],
      numbersMastered: [1, 3, 7, 10],
      stickersCollected: [],
      lastPlayedDate: '2024-06-15T14:30:00.000Z',
      activityHistory: [],
    };

    const stats = computeStats(progress);

    expect(stats.numbersMastered).toBe(4);
  });

  it('correctly counts stickers collected', () => {
    const stickers = [makeSticker('s1'), makeSticker('s2'), makeSticker('s3')];
    const progress: ProgressData = {
      activitiesCompleted: 3,
      lettersLearned: [],
      numbersMastered: [],
      stickersCollected: stickers,
      lastPlayedDate: '2024-06-15T14:30:00.000Z',
      activityHistory: [],
    };

    const stats = computeStats(progress);

    expect(stats.stickersCollected).toBe(3);
  });

  it('formats lastPlayedDate as a readable string', () => {
    const progress: ProgressData = {
      activitiesCompleted: 1,
      lettersLearned: [],
      numbersMastered: [],
      stickersCollected: [],
      lastPlayedDate: '2024-06-15T14:30:00.000Z',
      activityHistory: [],
    };

    const stats = computeStats(progress);

    // Should produce a non-empty formatted date string
    expect(stats.lastPlayedDate).not.toBe('');
    // Should contain the year
    expect(stats.lastPlayedDate).toContain('2024');
  });

  it('returns empty string for lastPlayedDate when invalid ISO string', () => {
    const progress: ProgressData = {
      activitiesCompleted: 1,
      lettersLearned: [],
      numbersMastered: [],
      stickersCollected: [],
      lastPlayedDate: 'not-a-date',
      activityHistory: [],
    };

    const stats = computeStats(progress);

    expect(stats.lastPlayedDate).toBe('');
  });

  it('computes all metrics correctly for full progress data', () => {
    const stickers = [
      makeSticker('s1'),
      makeSticker('s2'),
      makeSticker('s3'),
      makeSticker('s4'),
      makeSticker('s5'),
    ];
    const progress: ProgressData = {
      activitiesCompleted: 12,
      lettersLearned: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
      numbersMastered: [1, 2, 3, 4, 5],
      stickersCollected: stickers,
      lastPlayedDate: '2024-12-25T09:00:00.000Z',
      activityHistory: [
        {
          activityType: 'letter-recognition',
          completedAt: '2024-12-25T09:00:00.000Z',
          correctAnswers: 5,
          totalQuestions: 5,
        },
      ],
    };

    const stats = computeStats(progress);

    expect(stats.activitiesCompleted).toBe(12);
    expect(stats.lettersLearned).toBe(8);
    expect(stats.numbersMastered).toBe(5);
    expect(stats.stickersCollected).toBe(5);
    expect(stats.lastPlayedDate).toContain('2024');
  });
});
