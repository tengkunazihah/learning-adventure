import type { Question, AnswerOption } from '@/types/activity';
import {
  ANIMAL_TYPES,
  MIN_COUNT,
  MAX_COUNT,
  ANSWER_OPTIONS_COUNT,
  QUESTIONS_PER_SESSION,
} from '@/lib/constants';
import { randomInt, shuffle, randomPick } from '@/lib/random';

/**
 * Generates distractor values for Count the Animals questions.
 * Distractors are unique integers within ±3 of the correct answer,
 * clamped between MIN_COUNT and MAX_COUNT.
 */
function generateDistractors(correctCount: number, count: number): number[] {
  const min = Math.max(MIN_COUNT, correctCount - 3);
  const max = Math.min(MAX_COUNT, correctCount + 3);

  // Build pool of candidate distractor values (excluding the correct answer)
  const candidates: number[] = [];
  for (let i = min; i <= max; i++) {
    if (i !== correctCount) {
      candidates.push(i);
    }
  }

  // Shuffle and pick the required number of distractors
  const shuffled = shuffle(candidates);
  return shuffled.slice(0, count);
}

/**
 * Generates a single Count the Animals question.
 *
 * - Picks a random count between 1-10
 * - Picks a random animal from ANIMAL_TYPES
 * - Generates 3 unique distractor values within ±3 of the correct answer (clamped 1-10)
 * - Combines correct + distractors and shuffles
 * - Returns a Question with speechText "How many animals do you see?"
 */
export function generateCountAnimalsQuestion(): Question {
  const correctCount = randomInt(MIN_COUNT, MAX_COUNT);
  const animal = randomPick(ANIMAL_TYPES);
  const distractorCount = ANSWER_OPTIONS_COUNT - 1;

  const distractors = generateDistractors(correctCount, distractorCount);

  // Build all option values (correct + distractors)
  const allValues = [correctCount, ...distractors];

  // Create AnswerOption objects
  const options: AnswerOption[] = allValues.map((value, index) => ({
    id: `option-${index}`,
    label: String(value),
    value,
  }));

  // Shuffle options so correct answer isn't always first
  const shuffledOptions = shuffle(options);

  // Re-assign IDs after shuffle to keep them consistent
  const finalOptions: AnswerOption[] = shuffledOptions.map((opt, index) => ({
    ...opt,
    id: `option-${index}`,
  }));

  // Find the correct option's ID
  const correctOption = finalOptions.find((opt) => opt.value === correctCount)!;

  const questionId = `count-animals-${Date.now()}-${randomInt(0, 9999)}`;

  return {
    id: questionId,
    type: 'count-animals',
    prompt: `Count the ${animal.toLowerCase()}s! How many do you see?`,
    options: finalOptions,
    correctOptionId: correctOption.id,
    speechText: 'How many animals do you see?',
  };
}

/**
 * Generates a batch of Count the Animals questions for a session.
 * Produces QUESTIONS_PER_SESSION + 5 questions to allow shuffling/selection
 * by useActivitySession.
 */
export function generateCountAnimalsQuestions(): Question[] {
  const totalQuestions = QUESTIONS_PER_SESSION + 5;
  const questions: Question[] = [];

  for (let i = 0; i < totalQuestions; i++) {
    questions.push(generateCountAnimalsQuestion());
  }

  return questions;
}
