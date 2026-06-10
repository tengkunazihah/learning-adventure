import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { generateLetterRecognitionQuestion } from './letter-recognition';
import { ANSWER_OPTIONS_COUNT } from '@/lib/constants';

/**
 * Property-based tests for Letter Recognition question generator.
 */
describe('generateLetterRecognitionQuestion - property-based tests', () => {
  /**
   * Property 8: Target letter is always a valid uppercase A-Z.
   * Validates: Requirements 5.1
   *
   * FOR ALL letter recognition questions q:
   *   q.targetLetter (correct option value) matches /^[A-Z]$/
   */
  it('target letter (correct option value) always matches /^[A-Z]$/', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const question = generateLetterRecognitionQuestion();
        const correctOption = question.options.find(
          (o) => o.id === question.correctOptionId
        );
        expect(correctOption).toBeDefined();
        const value = correctOption!.value as string;
        expect(value).toMatch(/^[A-Z]$/);
      }),
      { numRuns: 200 }
    );
  });

  /**
   * Property 2 & 3: Exactly 4 options, all distinct values, exactly one correct answer.
   * Validates: Requirements 2.3, 5.2
   *
   * FOR ALL questions q:
   *   q.options.length === 4
   *   AND all option values are distinct
   *   AND exactly one option matches correctOptionId
   */
  it('has exactly 4 options with all distinct values and exactly one correct answer', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const question = generateLetterRecognitionQuestion();

        // Exactly 4 options
        expect(question.options).toHaveLength(ANSWER_OPTIONS_COUNT);

        // All option values are distinct
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
