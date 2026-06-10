import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { randomInt } from './random';

/**
 * Property-based tests for randomInt utility.
 * Validates: Requirements 2.1, 3.1
 *
 * FOR ALL min, max where min <= max:
 *   randomInt(min, max) >= min
 *   AND randomInt(min, max) <= max
 *   AND Number.isInteger(randomInt(min, max))
 */
describe('randomInt - property-based tests', () => {
  it('always produces values within the specified range', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -1000, max: 1000 }),
        fc.integer({ min: -1000, max: 1000 }),
        (a, b) => {
          const min = Math.min(a, b);
          const max = Math.max(a, b);
          const result = randomInt(min, max);
          expect(result).toBeGreaterThanOrEqual(min);
          expect(result).toBeLessThanOrEqual(max);
        }
      ),
      { numRuns: 1000 }
    );
  });

  it('always returns an integer', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -1000, max: 1000 }),
        fc.integer({ min: -1000, max: 1000 }),
        (a, b) => {
          const min = Math.min(a, b);
          const max = Math.max(a, b);
          const result = randomInt(min, max);
          expect(Number.isInteger(result)).toBe(true);
        }
      ),
      { numRuns: 1000 }
    );
  });
});
