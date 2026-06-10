import type { Question, AnswerOption } from '@/types/activity';
import { ANSWER_OPTIONS_COUNT, QUESTIONS_PER_SESSION } from '@/lib/constants';
import { randomInt, shuffle, randomPick, randomPickN } from '@/lib/random';

/** All uppercase letters A-Z */
export const UPPERCASE_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/**
 * Generates a single Letter Recognition question.
 *
 * - Picks a random target uppercase letter
 * - Generates 3 distractor letters (different from target)
 * - Creates 4 options shuffled
 * - speechText: the letter itself (e.g., "A")
 * - prompt: "Find the letter [X]!"
 */
export function generateLetterRecognitionQuestion(): Question {
  const target = randomPick(UPPERCASE_LETTERS);

  // Pick 3 distractor letters different from target
  const distractorPool = UPPERCASE_LETTERS.filter((l) => l !== target);
  const distractors = randomPickN(distractorPool, ANSWER_OPTIONS_COUNT - 1);

  // Combine correct + distractors and shuffle
  const allValues = [target, ...distractors];
  const shuffledValues = shuffle(allValues);

  // Create AnswerOption objects
  const options: AnswerOption[] = shuffledValues.map((letter, index) => ({
    id: `option-${index}`,
    label: letter,
    value: letter,
  }));

  // Find the correct option's ID
  const correctOption = options.find((opt) => opt.value === target)!;

  const questionId = `letter-recognition-${Date.now()}-${randomInt(0, 9999)}`;

  return {
    id: questionId,
    type: 'letter-recognition',
    prompt: `Find the letter ${target}!`,
    options,
    correctOptionId: correctOption.id,
    speechText: target,
  };
}

/**
 * Generates a batch of Letter Recognition questions for a session.
 * Produces QUESTIONS_PER_SESSION + 5 questions to allow shuffling/selection
 * by useActivitySession.
 */
export function generateLetterRecognitionQuestions(): Question[] {
  const totalQuestions = QUESTIONS_PER_SESSION + 5;
  const questions: Question[] = [];

  for (let i = 0; i < totalQuestions; i++) {
    questions.push(generateLetterRecognitionQuestion());
  }

  return questions;
}
