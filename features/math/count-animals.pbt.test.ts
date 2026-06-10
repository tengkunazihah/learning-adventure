import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { generateCountAnimalsQuestion } from './count-animals';
import { MIN_COUNT, MAX_COUNT, ANSWER_OPTIONS_COUNT } from '@/lib/constants';

/**
 * Property-based tests for Count the Animals question generator.
 */
describe('generateCountAnimalsQuestion - property-based tests', () => {
  /**
   * Property 1: Generated count is always between 1 and 10 inclusive.
   * Validates: Requirements 2.1, 3.1
   *
   * FOR ALL generated questions:
   *   correctAnswer >= 1 AND correctAnswer <= 10
   */
  it('correct answer value is always between 1 and 10 inclusive', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const question = generateCountAnimalsQuestion();
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
   * Property 2 & 3: Exactly 4 unique answer options with correct answer included.
   * Validates: Requirements 2.3, 3.2
   *
   * FOR ALL questions:
   *   options.length === 4
   *   AND all option values are unique
   *   AND exactly one option matches correctOptionId
   */
  it('has exactly 4 unique answer options with correct answer included', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const question = generateCountAnimalsQuestion();

        // Exactly 4 options
        expect(question.options).toHaveLength(ANSWER_OPTIONS_COUNT);

        // All option values are unique
        const values = question.options.map((o) => o.value);
        expect(new Set(values).size).toBe(values.length);

        // Exactly one option matches correctOptionId
        const matchingOptions = question.options.filter(
          (o) => o.id === question.correctOptionId
        );
        expect(matchingOptions).toHaveLength(1);
      }),
      { numRuns: 200 }
    );
  });
});
