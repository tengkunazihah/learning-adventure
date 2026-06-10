import type { AnswerOption } from '@/types/activity';
import { randomInt, shuffle } from '@/lib/random';
import { PLACEMENT_THRESHOLDS, PLACEMENT_STICKER_REWARDS, OPPONENT_POSITION_CAP } from '@/lib/constants';

/** Race character identifiers */
export type RaceCharacter = 'duck' | 'panda' | 'rabbit';

/** Placement result */
export type Placement = 1 | 2 | 3;

/** A math race question */
export interface RaceQuestion {
  id: string;
  operand1: number;
  operand2: number;
  operation: 'addition' | 'subtraction';
  correctAnswer: number;
  options: AnswerOption[];
  correctOptionId: string;
  speechText: string;
}

/**
 * Generates distractor values for a race question.
 *
 * Starts with ±3 range around the correct answer, clamped to [0, 20].
 * Expands range by 1 in each direction if fewer than `count` candidates
 * exist after excluding the correct answer.
 */
export function generateRaceDistractors(correctAnswer: number, count: number): number[] {
  let low = Math.max(0, correctAnswer - 3);
  let high = Math.min(20, correctAnswer + 3);

  // Build candidate pool, expanding if needed
  let candidates: number[] = [];
  while (true) {
    candidates = [];
    for (let i = low; i <= high; i++) {
      if (i !== correctAnswer) {
        candidates.push(i);
      }
    }
    if (candidates.length >= count) {
      break;
    }
    // Expand range by 1 in each direction, clamped to [0, 20]
    low = Math.max(0, low - 1);
    high = Math.min(20, high + 1);
  }

  // Shuffle and pick the required number of distractors
  const shuffled = shuffle(candidates);
  return shuffled.slice(0, count);
}

/**
 * Generates a single math race question.
 *
 * - Randomly selects addition or subtraction
 * - Picks operands in [1, 10]
 * - For subtraction, ensures operand1 >= operand2 (result ≥ 0)
 * - Computes correct answer
 * - Generates 3 unique distractors within ±3 (expanding if needed)
 * - Shuffles all 4 options
 * - Produces speechText in "What is X plus/minus Y?" format
 */
export function generateRaceQuestion(): RaceQuestion {
  const operation = randomInt(0, 1) === 0 ? 'addition' : 'subtraction';

  let operand1 = randomInt(1, 10);
  let operand2 = randomInt(1, 10);

  // For subtraction, ensure operand1 >= operand2 so result is non-negative
  if (operation === 'subtraction' && operand1 < operand2) {
    [operand1, operand2] = [operand2, operand1];
  }

  const correctAnswer =
    operation === 'addition' ? operand1 + operand2 : operand1 - operand2;

  const distractors = generateRaceDistractors(correctAnswer, 3);

  // Build all option values (correct + distractors)
  const allValues = [correctAnswer, ...distractors];

  // Create AnswerOption objects
  const options: AnswerOption[] = allValues.map((value, index) => ({
    id: `option-${index}`,
    label: String(value),
    value,
  }));

  // Shuffle options so correct answer isn't always first
  const shuffledOptions = shuffle(options);

  // Re-assign IDs after shuffle
  const finalOptions: AnswerOption[] = shuffledOptions.map((opt, index) => ({
    ...opt,
    id: `option-${index}`,
  }));

  // Find the correct option's ID
  const correctOption = finalOptions.find((opt) => opt.value === correctAnswer)!;

  const operationWord = operation === 'addition' ? 'plus' : 'minus';
  const speechText = `What is ${operand1} ${operationWord} ${operand2}?`;

  const questionId = `math-race-${Date.now()}-${randomInt(0, 9999)}`;

  return {
    id: questionId,
    operand1,
    operand2,
    operation,
    correctAnswer,
    options: finalOptions,
    correctOptionId: correctOption.id,
    speechText,
  };
}

/**
 * Generates a batch of race questions for a session.
 * Returns an array of `count` questions, each with 4 shuffled unique options.
 */
export function generateRaceQuestions(count: number): RaceQuestion[] {
  const questions: RaceQuestion[] = [];
  for (let i = 0; i < count; i++) {
    questions.push(generateRaceQuestion());
  }
  return questions;
}


/**
 * Calculates placement from accuracy percentage.
 * Returns 1 if accuracy >= 75%, 2 if >= 50%, 3 otherwise.
 */
export function calculatePlacement(accuracyPercent: number): Placement {
  if (accuracyPercent >= PLACEMENT_THRESHOLDS.FIRST) return 1;
  if (accuracyPercent >= PLACEMENT_THRESHOLDS.SECOND) return 2;
  return 3;
}

/**
 * Calculates sticker count from placement.
 * 1st place = 3 stickers, 2nd = 1, 3rd = 0.
 */
export function calculateStickerReward(placement: Placement): number {
  return PLACEMENT_STICKER_REWARDS[placement];
}

/**
 * Calculates player position increment per correct answer.
 * Each correct answer advances the player by 100/questionsTotal percent.
 */
export function getPlayerIncrement(questionsTotal: number): number {
  return 100 / questionsTotal;
}

/**
 * Calculates opponent final positions based on player accuracy and placement tier.
 *
 * - 1st place (accuracy >= 75%): both opponents finish BELOW player position
 * - 2nd place (50% <= accuracy < 75%): one opponent above, one below player
 * - 3rd place (accuracy < 50%): both opponents finish ABOVE player position
 *
 * Player final position = playerAccuracy (as a percentage of the track).
 * Opponent positions are in [0, 100].
 */
export function calculateOpponentPositions(
  playerAccuracy: number,
  questionsTotal: number
): { opponent1: number; opponent2: number } {
  const playerPosition = playerAccuracy;
  const placement = calculatePlacement(playerAccuracy);

  let opponent1: number;
  let opponent2: number;

  if (placement === 1) {
    // Both opponents finish below player position
    // Generate positions between 0 and playerPosition (exclusive)
    const maxOpponent = Math.max(0, playerPosition - 1);
    if (maxOpponent <= 0) {
      opponent1 = 0;
      opponent2 = 0;
    } else {
      opponent1 = randomInt(Math.floor(maxOpponent * 0.4), Math.floor(maxOpponent));
      opponent2 = randomInt(0, Math.floor(maxOpponent * 0.7));
    }
  } else if (placement === 2) {
    // One opponent above player, one below
    // Opponent above: between playerPosition+1 and 100
    const minAbove = Math.min(100, Math.ceil(playerPosition + 1));
    opponent1 = randomInt(minAbove, 100);

    // Opponent below: between 0 and playerPosition-1
    const maxBelow = Math.max(0, Math.floor(playerPosition - 1));
    opponent2 = randomInt(0, maxBelow);
  } else {
    // 3rd place: both opponents finish above player position
    // Generate positions between playerPosition (exclusive) and 100
    const minOpponent = Math.min(100, Math.ceil(playerPosition + 1));
    if (minOpponent >= 100) {
      opponent1 = 100;
      opponent2 = 100;
    } else {
      opponent1 = randomInt(minOpponent, 100);
      opponent2 = randomInt(minOpponent, 100);
    }
  }

  // Clamp to [0, 100]
  opponent1 = Math.max(0, Math.min(100, opponent1));
  opponent2 = Math.max(0, Math.min(100, opponent2));

  return { opponent1, opponent2 };
}
