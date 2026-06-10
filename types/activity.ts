export type ActivityType =
  | 'count-animals'
  | 'number-matching'
  | 'shape-hunt'
  | 'letter-recognition'
  | 'beginning-sounds'
  | 'first-words';

export interface AnswerOption {
  id: string;
  label: string;
  imageUrl?: string;
  value: number | string;
}

export interface Question {
  id: string;
  type: ActivityType;
  prompt: string;
  options: AnswerOption[];
  correctOptionId: string;
  speechText: string;
}

export interface ActivitySession {
  activityType: ActivityType;
  questions: Question[];
  currentIndex: number;
  correctCount: number;
  startedAt: number;
  completedAt?: number;
}
