import { act, renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

import { QUESTIONS_PER_SESSION } from '@/lib/constants';
import type { Question } from '@/types/activity';

import { useActivitySession } from './useActivitySession';

/**
 * Property-based tests for useActivitySession score monotonicity.
 * Validates: Requirements 9.5
 *
 * FOR ALL answer sequences [a1, a2, ..., aN]:
 *   FOR ALL i where 1 <= i < N:
 *     session.correctCount after processing a[i+1] >= session.correctCount after processing a[i]
 *
 * The correctCount should never decrease regardless of the sequence of
 * correct/incorrect answers applied to the session.
 */

function makeQuestion(id: string, correctOptionId: string = 'opt-a'): Question {
  return {
    id,
    type: 'count-animals',
    prompt: `Question ${id}`,
    options: [
      { id: 'opt-a', label: 'A', value: 1 },
      { id: 'opt-b', label: 'B', value: 2 },
      { id: 'opt-c', label: 'C', value: 3 },
      { id: 'opt-d', label: 'D', value: 4 },
    ],
    correctOptionId,
    speechText: `Question ${id}`,
  };
}

function makeQuestions(count: number = 10): Question[] {
  return Array.from({ length: count }, (_, i) => makeQuestion(`q${i + 1}`));
}

describe('useActivitySession - score never decreases (PBT)', () => {
  it('correctCount is monotonically non-decreasing for any answer sequence', () => {
    fc.assert(
      fc.property(
        // Generate an arbitrary sequence of booleans representing correct (true)
        // or incorrect (false) answers. Length up to 20 to cover multiple questions
        // and retries.
        fc.array(fc.boolean(), { minLength: 1, maxLength: 20 }),
        (answerSequence) => {
          const generator = () => makeQuestions(10);
          const { result } = renderHook(() =>
            useActivitySession('count-animals', generator)
          );

          let previousCorrectCount = result.current.correctCount;

          for (const isCorrect of answerSequence) {
            // If session is already complete, stop processing
            if (result.current.isComplete) break;

            const currentQuestion = result.current.currentQuestion;
            if (!currentQuestion) break;

            const optionId = isCorrect
              ? currentQuestion.correctOptionId
              : 'opt-b'; // incorrect option

            act(() => {
              result.current.handleAnswer(optionId);
            });

            // Core property: correctCount must never decrease
            expect(result.current.correctCount).toBeGreaterThanOrEqual(
              previousCorrectCount
            );

            previousCorrectCount = result.current.correctCount;
          }
        }
      ),
      { numRuns: 200 }
    );
  });

  it('correctCount never decreases even with alternating correct/incorrect patterns', () => {
    fc.assert(
      fc.property(
        // Generate sequences that specifically mix correct and incorrect answers
        // using a more varied pattern: tuples of (retries before correct, then correct)
        fc.array(
          fc.record({
            incorrectAttempts: fc.nat({ max: 5 }),
            finishWithCorrect: fc.boolean(),
          }),
          { minLength: 1, maxLength: QUESTIONS_PER_SESSION }
        ),
        (patterns) => {
          const generator = () => makeQuestions(10);
          const { result } = renderHook(() =>
            useActivitySession('count-animals', generator)
          );

          let previousCorrectCount = result.current.correctCount;

          for (const pattern of patterns) {
            if (result.current.isComplete) break;

            const currentQuestion = result.current.currentQuestion;
            if (!currentQuestion) break;

            // Apply incorrect attempts
            for (let i = 0; i < pattern.incorrectAttempts; i++) {
              if (result.current.isComplete) break;

              act(() => {
                result.current.handleAnswer('opt-b');
              });

              expect(result.current.correctCount).toBeGreaterThanOrEqual(
                previousCorrectCount
              );
              previousCorrectCount = result.current.correctCount;
            }

            // Optionally answer correctly
            if (pattern.finishWithCorrect && !result.current.isComplete) {
              const q = result.current.currentQuestion;
              if (q) {
                act(() => {
                  result.current.handleAnswer(q.correctOptionId);
                });

                expect(result.current.correctCount).toBeGreaterThanOrEqual(
                  previousCorrectCount
                );
                previousCorrectCount = result.current.correctCount;
              }
            }
          }
        }
      ),
      { numRuns: 200 }
    );
  });
});
