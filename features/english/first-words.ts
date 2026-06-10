import type { Question, AnswerOption } from '@/types/activity';
import { QUESTIONS_PER_SESSION } from '@/lib/constants';
import { shuffle } from '@/lib/random';

/** Word data for the First Words activity */
export interface WordData {
  word: string;
  emoji: string;
  animation: string;
}

/** 10 words with emoji images and CSS animation class names (Req 7.1, 7.2, 7.3) */
export const FIRST_WORDS_DATA: readonly WordData[] = [
  { word: 'Cat', emoji: '🐱', animation: 'animate-bounce' },
  { word: 'Dog', emoji: '🐶', animation: 'animate-bounce' },
  { word: 'Ball', emoji: '⚽', animation: 'animate-bounce' },
  { word: 'Car', emoji: '🚗', animation: 'animate-pulse' },
  { word: 'Apple', emoji: '🍎', animation: 'animate-pulse' },
  { word: 'Fish', emoji: '🐟', animation: 'animate-bounce' },
  { word: 'Tree', emoji: '🌳', animation: 'animate-pulse' },
  { word: 'Bird', emoji: '🐦', animation: 'animate-bounce' },
  { word: 'Book', emoji: '📖', animation: 'animate-pulse' },
  { word: 'Sun', emoji: '☀️', animation: 'animate-spin slow' },
] as const;

/**
 * Generates questions compatible with useActivitySession for the First Words activity.
 *
 * For First Words, each "question" presents a word with its emoji.
 * The prompt is the word, speechText is the word for pronunciation (Req 7.5),
 * and a single "Next" option advances to the next word.
 *
 * Picks QUESTIONS_PER_SESSION words from the pool (Req 7.4: 5 words per session).
 */
export function generateFirstWordsQuestions(): Question[] {
  const selectedWords = shuffle([...FIRST_WORDS_DATA]).slice(
    0,
    QUESTIONS_PER_SESSION
  );

  return selectedWords.map((wordData, index) => {
    const option: AnswerOption = {
      id: 'next',
      label: 'Next',
      value: wordData.word,
    };

    return {
      id: `first-words-${index}`,
      type: 'first-words' as const,
      prompt: wordData.word,
      options: [option],
      correctOptionId: 'next',
      speechText: wordData.word,
    };
  });
}
