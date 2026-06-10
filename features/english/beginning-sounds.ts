import type { Question, AnswerOption } from '@/types/activity';
import { ANSWER_OPTIONS_COUNT, QUESTIONS_PER_SESSION } from '@/lib/constants';
import { randomInt, shuffle, randomPick, randomPickN } from '@/lib/random';

/** Letter-picture pair representing a word beginning with a specific letter sound */
export interface LetterPicturePair {
  letter: string;
  word: string;
  emoji: string;
}

/** Minimum 12 distinct letter-picture pairs for Beginning Sounds activity */
export const LETTER_PICTURE_PAIRS: readonly LetterPicturePair[] = [
  { letter: 'A', word: 'Apple', emoji: '🍎' },
  { letter: 'B', word: 'Ball', emoji: '⚽' },
  { letter: 'C', word: 'Cat', emoji: '🐱' },
  { letter: 'D', word: 'Dog', emoji: '🐶' },
  { letter: 'F', word: 'Fish', emoji: '🐟' },
  { letter: 'G', word: 'Grapes', emoji: '🍇' },
  { letter: 'H', word: 'Hat', emoji: '🎩' },
  { letter: 'L', word: 'Lion', emoji: '🦁' },
  { letter: 'M', word: 'Moon', emoji: '🌙' },
  { letter: 'P', word: 'Pig', emoji: '🐷' },
  { letter: 'R', word: 'Rainbow', emoji: '🌈' },
  { letter: 'S', word: 'Sun', emoji: '☀️' },
  { letter: 'T', word: 'Tree', emoji: '🌳' },
] as const;

/**
 * Generates a single Beginning Sounds question.
 *
 * - Picks a random letter-picture pair as the target
 * - Picks 3 distractor pairs (different letters)
 * - Creates 4 options with emoji as label
 * - prompt: "Which picture starts with [letter]?"
 * - speechText: "Which picture starts with [letter]?"
 */
export function generateBeginningSoundsQuestion(): Question {
  const target = randomPick(LETTER_PICTURE_PAIRS);

  // Pick 3 distractor pairs with different letters
  const distractorPool = LETTER_PICTURE_PAIRS.filter(
    (pair) => pair.letter !== target.letter
  );
  const distractors = randomPickN(distractorPool, ANSWER_OPTIONS_COUNT - 1);

  // Combine correct + distractors and shuffle
  const allPairs = [target, ...distractors];
  const shuffledPairs = shuffle(allPairs);

  // Create AnswerOption objects with emoji as label
  const options: AnswerOption[] = shuffledPairs.map((pair, index) => ({
    id: `option-${index}`,
    label: pair.emoji,
    value: pair.letter,
  }));

  // Find the correct option's ID
  const correctOption = options.find((opt) => opt.value === target.letter)!;

  const questionId = `beginning-sounds-${Date.now()}-${randomInt(0, 9999)}`;

  return {
    id: questionId,
    type: 'beginning-sounds',
    prompt: `Which picture starts with ${target.letter}?`,
    options,
    correctOptionId: correctOption.id,
    speechText: `Which picture starts with ${target.letter}?`,
  };
}

/**
 * Generates a batch of Beginning Sounds questions for a session.
 * Produces QUESTIONS_PER_SESSION + 5 questions to allow shuffling/selection
 * by useActivitySession.
 */
export function generateBeginningSoundsQuestions(): Question[] {
  const totalQuestions = QUESTIONS_PER_SESSION + 5;
  const questions: Question[] = [];

  for (let i = 0; i < totalQuestions; i++) {
    questions.push(generateBeginningSoundsQuestion());
  }

  return questions;
}
