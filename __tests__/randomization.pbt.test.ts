import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { generateCountAnimalsQuestions } from '@/features/math/count-animals';
import { QUESTIONS_PER_SESSION } from '@/lib/constants';

/**
 * Property-based test for question order randomization across sessions.
 * Validates: Requirements 15.4
 *
 * Property 10: Question Order Is Randomized (Non-Deterministic)
 * For sufficient sample size (10 generations), NOT ALL orderings are identical.
 *
 * This verifies that the shuffle in useActivitySession / question generators
 * produces varied orderings across multiple session generations.
 */
describe('Question Order Randomization - property-based tests', () => {
  /**
   * Property: For 10 generations of questions, at least 2 different orderings exist.
   * Validates: Requirements 15.4
   *
   * We generate the question set 10 times and compare the ordering of question prompts.
   * With randomization in place, it is astronomically unlikely that all 10 orderings
   * would be identical (probability approaches 0 for sets with >1 element).
   */
  it('question order varies across multiple session generations', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const NUM_GENERATIONS = 10;
        const orderings: string[][] = [];

        for (let i = 0; i < NUM_GENERATIONS; i++) {
          const questions = generateCountAnimalsQuestions();
          // Take the first QUESTIONS_PER_SESSION questions (same as useActivitySession does)
          const sessionQuestions = questions.slice(0, QUESTIONS_PER_SESSION);
          // Record the ordering by capturing the prompt strings
          orderings.push(sessionQuestions.map((q) => q.prompt));
        }

        // Check that NOT all orderings are identical
        const firstOrdering = JSON.stringify(orderings[0]);
        const allIdentical = orderings.every(
          (ordering) => JSON.stringify(ordering) === firstOrdering
        );

        expect(allIdentical).toBe(false);
      }),
      { numRuns: 50 }
    );
  });
});
