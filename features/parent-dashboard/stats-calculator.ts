import type { ProgressData } from '@/types/progress';

export interface DashboardStats {
  activitiesCompleted: number;
  lettersLearned: number;
  numbersMastered: number;
  stickersCollected: number;
  lastPlayedDate: string;
}

/**
 * Computes dashboard display metrics from raw progress data.
 *
 * - lettersLearned: count of letters in the lettersLearned array
 * - numbersMastered: count of numbers in the numbersMastered array
 * - stickersCollected: total stickers earned
 * - lastPlayedDate: formatted date string or empty if never played
 */
export function computeStats(progress: ProgressData): DashboardStats {
  return {
    activitiesCompleted: progress.activitiesCompleted,
    lettersLearned: progress.lettersLearned.length,
    numbersMastered: progress.numbersMastered.length,
    stickersCollected: progress.stickersCollected.length,
    lastPlayedDate: progress.lastPlayedDate
      ? formatDate(progress.lastPlayedDate)
      : '',
  };
}

/**
 * Formats an ISO date string into a human-friendly display format.
 */
function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}
