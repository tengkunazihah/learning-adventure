import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { generateNumberMatchingQuestion } from './number-matching';
import { MIN_COUNT, MAX_COUNT, ANSWER_OPTIONS_COUNT } from '@/lib/constants';

/**
 * Property-based tests for Number Matching question generator.
 */
describe('generateNumberMatchingQuestion - property-based tests', () => {
  /**
   * Property 1: Target number (correct option value) is always between 1 and 10 inclusive.
   * Validates: Requirements 2.1, 3.1
   *
   * FOR ALL generated questions:
   *   correctAnswer >= 1 AND correctAnswer <= 10
   */
  it('target number (correct option value) is always between 1 and 10 inclusive', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const question = generateNumberMatchingQuestion();
        const correctOption = question.options.find(
          (o) => o.id === question.correctOptionId
        );
        expect(correctOption).toBeDefined();
        const value = correctOption!.value as number;
        expect(value).toBeGreaterThanOrEqual(MIN_COUNT);
        expect(value).toBeLessThanOrEqual(MAX_COUNT);
      }),
      { numRuns: 200 }
    );
  });

  /**
   * Property 2: All 4 option values are distinct quantities.
   * Validates: Requirements 2.3, 3.2
   *
   * FOR ALL generated questions:
   *   options.length === 4
   *   AND all option values are unique (distinct quantities)
   */
  it('all 4 option values are distinct quantities', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const question = generateNumberMatchingQuestion();

        // Exactly 4 options
        expect(question.options).toHaveLength(ANSWER_OPTIONS_COUNT);

        // All option values are unique (distinct quantities)
        const values = question.options.map((o) => o.value);
        expect(new Set(values).size).toBe(values.length);
      }),
      { numRuns: 200 }
    );
  });
});
