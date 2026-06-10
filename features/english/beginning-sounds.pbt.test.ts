import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { generateBeginningSoundsQuestion, LETTER_PICTURE_PAIRS } from './beginning-sounds';
import { ANSWER_OPTIONS_COUNT } from '@/lib/constants';

/**
 * Property-based tests for Beginning Sounds question generator.
 */
describe('generateBeginningSoundsQuestion - property-based tests', () => {
  /**
   * Property: Options always include exactly one correct picture matching the target letter.
   * Validates: Requirements 6.1
   *
   * FOR ALL beginning sounds questions q:
   *   q.options contains exactly one option whose value matches the target letter
   *   AND q.correctOptionId points to that option
   *   AND the correct option's emoji corresponds to a valid letter-picture pair
   */
  it('options always include the correct picture matching the target letter', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const question = generateBeginningSoundsQuestion();

        // correctOptionId must reference an existing option
        const correctOption = question.options.find(
          (o) => o.id === question.correctOptionId
        );
        expect(correctOption).toBeDefined();

        // The correct option's value (letter) must exist in LETTER_PICTURE_PAIRS
        const targetLetter = correctOption!.value as string;
        const matchingPair = LETTER_PICTURE_PAIRS.find(
          (pair) => pair.letter === targetLetter
        );
        expect(matchingPair).toBeDefined();

        // The correct option's label (emoji) must match the pair's emoji
        expect(correctOption!.label).toBe(matchingPair!.emoji);

        // Exactly one option has the target letter value
        const optionsWithTargetLetter = question.options.filter(
          (o) => o.value === targetLetter
        );
        expect(optionsWithTargetLetter).toHaveLength(1);

        // Exactly ANSWER_OPTIONS_COUNT options total
        expect(question.options).toHaveLength(ANSWER_OPTIONS_COUNT);
      }),
      { numRuns: 200 }
    );
  });

  /**
   * Property: All 4 options have distinct values (different letters).
   * Validates: Requirements 6.1
   *
   * FOR ALL beginning sounds questions q:
   *   all option values are unique (no duplicate letters among the 4 choices)
   */
  it('all 4 options have distinct values (different letters)', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const question = generateBeginningSoundsQuestion();

        // Exactly 4 options
        expect(question.options).toHaveLength(ANSWER_OPTIONS_COUNT);

        // All option values (letters) are distinct
        const values = question.options.map((o) => o.value);
        expect(new Set(values).size).toBe(values.length);
      }),
      { numRuns: 200 }
    );
  });
});
