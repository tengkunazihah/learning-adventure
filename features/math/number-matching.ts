import type { Question, AnswerOption } from '@/types/activity';
import {
  MIN_COUNT,
  MAX_COUNT,
  ANSWER_OPTIONS_COUNT,
  QUESTIONS_PER_SESSION,
} from '@/lib/constants';
import { randomInt, shuffle, randomPick } from '@/lib/random';

/** Object types used for Number Matching groups */
const OBJECT_EMOJIS = ['🍎', '🌟', '🔵', '🟢', '🌸', '🎈', '⚽', '🎯'] as const;

/** Number words for speech synthesis */
const NUMBER_WORDS: Record<number, string> = {
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
  6: 'six',
  7: 'seven',
  8: 'eight',
  9: 'nine',
  10: 'ten',
};

/**
 * Generates 4 distinct quantities between MIN_COUNT and MAX_COUNT,
 * one of which is the target (correct) quantity.
 */
function generateDistinctQuantities(target: number): number[] {
  const candidates: number[] = [];
  for (let i = MIN_COUNT; i <= MAX_COUNT; i++) {
    if (i !== target) {
      candidates.push(i);
    }
  }

  const shuffled = shuffle(candidates);
  const distractors = shuffled.slice(0, ANSWER_OPTIONS_COUNT - 1);

  return shuffle([target, ...distractors]);
}

/**
 * Generates a single Number Matching question.
 *
 * - Picks a random target number between 1-10
 * - Picks a random emoji object type
 * - Creates 4 groups with distinct quantities (one matching the target)
 * - Each option's label shows the emoji repeated by its count
 * - speechText pronounces the target number
 */
export function generateNumberMatchingQuestion(): Question {
  const target = randomInt(MIN_COUNT, MAX_COUNT);
  const emoji = randomPick(OBJECT_EMOJIS);

  const quantities = generateDistinctQuantities(target);

  // Create AnswerOption objects where label is the emoji repeated by count
  const options: AnswerOption[] = quantities.map((quantity, index) => ({
    id: `option-${index}`,
    label: emoji.repeat(quantity),
    value: quantity,
  }));

  // Find the correct option's ID
  const correctOption = options.find((opt) => opt.value === target)!;

  const questionId = `number-matching-${Date.now()}-${randomInt(0, 9999)}`;

  return {
    id: questionId,
    type: 'number-matching',
    prompt: `Find the group with ${target} ${emoji}`,
    options,
    correctOptionId: correctOption.id,
    speechText: NUMBER_WORDS[target],
  };
}

/**
 * Generates a batch of Number Matching questions for a session.
 * Produces QUESTIONS_PER_SESSION + 5 questions to allow shuffling/selection
 * by useActivitySession.
 */
export function generateNumberMatchingQuestions(): Question[] {
  const totalQuestions = QUESTIONS_PER_SESSION + 5;
  const questions: Question[] = [];

  for (let i = 0; i < totalQuestions; i++) {
    questions.push(generateNumberMatchingQuestion());
  }

  return questions;
}
