import type { ActivityType } from './activity';
import type { Sticker } from './sticker';

export interface ProgressData {
  activitiesCompleted: number;
  lettersLearned: string[];
  numbersMastered: number[];
  stickersCollected: Sticker[];
  lastPlayedDate: string;
  activityHistory: ActivityRecord[];
}

export interface ActivityRecord {
  activityType: ActivityType;
  completedAt: string;
  correctAnswers: number;
  totalQuestions: number;
}
