import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { generateShapeHuntQuestion } from './shape-hunt';
import { SHAPES } from '@/lib/constants';

/**
 * Property-based tests for Shape Hunt question generator.
 */
describe('generateShapeHuntQuestion - property-based tests', () => {
  /**
   * Property 9: Displayed shapes always include the target shape.
   * Validates: Requirements 4.2
   *
   * FOR ALL shape hunt questions q:
   *   q.options.includes(q.targetShape) === true
   *
   * The target shape is derived from the correct option's value.
   */
  it('options always include the target shape (correct answer is always present)', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const question = generateShapeHuntQuestion();

        // Derive the target shape from the correct option
        const targetOption = question.options.find(
          (o) => o.id === question.correctOptionId
        );

        // The correct option must exist
        expect(targetOption).toBeDefined();

        // The target shape value must be a valid shape
        const targetShape = targetOption!.value as string;
        expect(SHAPES).toContain(targetShape);

        // The options must include an option whose value matches the target shape
        const optionValues = question.options.map((o) => o.value);
        expect(optionValues).toContain(targetShape);
      }),
      { numRuns: 200 }
    );
  });

  /**
   * Options count is always between 4 and 6.
   * Validates: Requirements 4.2
   *
   * FOR ALL shape hunt questions q:
   *   q.options.length >= 4 AND q.options.length <= 6
   */
  it('options count is always between 4 and 6', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const question = generateShapeHuntQuestion();

        expect(question.options.length).toBeGreaterThanOrEqual(4);
        expect(question.options.length).toBeLessThanOrEqual(6);
      }),
      { numRuns: 200 }
    );
  });
});
