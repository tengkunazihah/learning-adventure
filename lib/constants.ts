import type { StickerCategory } from '@/types/sticker';

/** Encouragement messages displayed on correct answers (Req 9.4) */
export const ENCOURAGEMENT_MESSAGES = [
  'Great job!',
  'Awesome!',
  'Well done!',
  'Fantastic!',
] as const;

/** Sticker reward categories (Req 8.2) */
export const STICKER_CATEGORIES: readonly StickerCategory[] = [
  'animals',
  'stars',
  'dinosaurs',
  'vehicles',
  'fruits',
] as const;

/** Shapes for Shape Hunt activity (Req 4.1) */
export const SHAPES = [
  'Circle',
  'Square',
  'Triangle',
  'Rectangle',
  'Star',
] as const;

/** First words for the English First Words activity (Req 7.1) */
export const FIRST_WORDS = [
  'Cat',
  'Dog',
  'Ball',
  'Car',
  'Apple',
  'Fish',
  'Tree',
  'Bird',
  'Book',
  'Sun',
] as const;

/** Animal types for Count the Animals activity (Req 2) */
export const ANIMAL_TYPES = [
  'Cat',
  'Dog',
  'Rabbit',
  'Elephant',
  'Giraffe',
  'Penguin',
  'Lion',
  'Bear',
] as const;

/** Object types for Visual Math Problems activity (Req 1.5) */
export const MATH_OBJECT_TYPES = [
  'apple', 'star', 'balloon', 'flower', 'fish', 'heart', 'cookie', 'butterfly'
] as const;

/** Emoji mapping for Visual Math Problems object types (Req 8.3) */
export const MATH_OBJECT_EMOJI_MAP: Record<string, string> = {
  apple: '🍎',
  star: '⭐',
  balloon: '🎈',
  flower: '🌸',
  fish: '🐟',
  heart: '❤️',
  cookie: '🍪',
  butterfly: '🦋',
};

/** Number of questions per activity session (Req 15.1) */
export const QUESTIONS_PER_SESSION = 5;

/** Minimum count value for counting activities */
export const MIN_COUNT = 1;

/** Maximum count value for counting activities */
export const MAX_COUNT = 10;

/** Number of answer options displayed per question */
export const ANSWER_OPTIONS_COUNT = 4;
