import type { Question, AnswerOption } from '@/types/activity';
import { SHAPES, QUESTIONS_PER_SESSION } from '@/lib/constants';
import { randomInt, shuffle, randomPick, randomPickN } from '@/lib/random';

/**
 * Generates a single Shape Hunt question.
 *
 * - Picks a random target shape from SHAPES
 * - Generates 3-5 distractor shapes (different from target)
 * - Creates options: target shape + distractors (4-6 total), shuffled
 * - Each option has label = shape name, value = shape name
 * - correctOptionId points to the one with the target shape
 * - speechText: "Tap the [shape]"
 * - prompt: "Tap the [shape]!"
 */
export function generateShapeHuntQuestion(): Question {
  const target = randomPick(SHAPES);

  // Determine total options count (4-6 as per Req 4.2)
  const totalOptions = randomInt(4, 6);
  const distractorCount = totalOptions - 1;

  // Build pool of distractor shapes (all shapes except target)
  const distractorPool = SHAPES.filter((s) => s !== target);

  // Pick distractors — allow duplicates if we need more than available unique shapes
  let distractors: string[];
  if (distractorCount <= distractorPool.length) {
    distractors = randomPickN(distractorPool, distractorCount);
  } else {
    // Need more distractors than unique shapes available; pick all unique then fill with random
    distractors = [...distractorPool];
    while (distractors.length < distractorCount) {
      distractors.push(randomPick(distractorPool));
    }
  }

  // Build all option values (target + distractors)
  const allShapes = [target, ...distractors];

  // Create AnswerOption objects
  const options: AnswerOption[] = allShapes.map((shape, index) => ({
    id: `option-${index}`,
    label: shape,
    value: shape,
  }));

  // Shuffle options so correct answer isn't always first
  const shuffledOptions = shuffle(options);

  // Re-assign IDs after shuffle to keep them consistent
  const finalOptions: AnswerOption[] = shuffledOptions.map((opt, index) => ({
    ...opt,
    id: `option-${index}`,
  }));

  // Find the correct option's ID (the one with the target shape value)
  const correctOption = finalOptions.find((opt) => opt.value === target)!;

  const questionId = `shape-hunt-${Date.now()}-${randomInt(0, 9999)}`;

  return {
    id: questionId,
    type: 'shape-hunt',
    prompt: `Tap the ${target}!`,
    options: finalOptions,
    correctOptionId: correctOption.id,
    speechText: `Tap the ${target}`,
  };
}

/**
 * Generates a batch of Shape Hunt questions for a session.
 * Produces QUESTIONS_PER_SESSION + 5 questions to allow shuffling/selection
 * by useActivitySession.
 */
export function generateShapeHuntQuestions(): Question[] {
  const totalQuestions = QUESTIONS_PER_SESSION + 5;
  const questions: Question[] = [];

  for (let i = 0; i < totalQuestions; i++) {
    questions.push(generateShapeHuntQuestion());
  }

  return questions;
}
