import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { LocalStorageAdapter, InMemoryAdapter, StorageAdapter } from './storage';

/**
 * Property-based tests for storage round-trip persistence.
 * Validates: Requirements 8.4, 10.7, 14.1, 14.4
 *
 * FOR ALL valid progressData p:
 *   storage.save('progress', p)
 *   storage.load<ProgressData>('progress') deepEquals p
 *
 * The storage layer uses JSON serialization internally, so we verify that
 * for all JSON-safe data, save followed by load produces equivalent output.
 * We normalize test data through JSON.parse(JSON.stringify(...)) to establish
 * the expected value, since that is the exact semantic contract of the adapters.
 */

// Generator for JSON-safe values using fc.jsonValue which guarantees JSON round-trip safety
const jsonSafeArbitrary = fc.jsonValue();

const keyArbitrary = fc.string({ minLength: 1, maxLength: 50 });

/**
 * Normalize data to its JSON-serialized form. This accounts for
 * known JSON quirks like -0 → 0 and establishes the expected contract.
 */
function jsonNormalize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

function runRoundTripTests(name: string, createAdapter: () => StorageAdapter) {
  describe(`${name} - round-trip persistence property`, () => {
    let adapter: StorageAdapter;

    beforeEach(() => {
      adapter = createAdapter();
      adapter.clear();
    });

    it('save then load produces equivalent data for arbitrary JSON values', () => {
      fc.assert(
        fc.property(keyArbitrary, jsonSafeArbitrary, (key, data) => {
          const expected = jsonNormalize(data);
          adapter.save(key, data);
          const loaded = adapter.load(key);
          expect(loaded).toEqual(expected);
        }),
        { numRuns: 200 }
      );
    });

    it('round-trips strings correctly', () => {
      fc.assert(
        fc.property(keyArbitrary, fc.string(), (key, data) => {
          adapter.save(key, data);
          const loaded = adapter.load<string>(key);
          expect(loaded).toEqual(data);
        }),
        { numRuns: 100 }
      );
    });

    it('round-trips integers correctly', () => {
      fc.assert(
        fc.property(
          keyArbitrary,
          fc.integer({ min: -1_000_000, max: 1_000_000 }),
          (key, data) => {
            adapter.save(key, data);
            const loaded = adapter.load<number>(key);
            expect(loaded).toEqual(data);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('round-trips arrays correctly', () => {
      fc.assert(
        fc.property(keyArbitrary, fc.array(jsonSafeArbitrary), (key, data) => {
          const expected = jsonNormalize(data);
          adapter.save(key, data);
          const loaded = adapter.load(key);
          expect(loaded).toEqual(expected);
        }),
        { numRuns: 100 }
      );
    });

    it('round-trips nested objects correctly', () => {
      fc.assert(
        fc.property(
          keyArbitrary,
          fc.record({
            name: fc.string(),
            count: fc.integer(),
            active: fc.boolean(),
            tags: fc.array(fc.string()),
            nested: fc.record({
              value: fc.oneof(fc.string(), fc.integer(), fc.constant(null)),
            }),
          }),
          (key, data) => {
            adapter.save(key, data);
            const loaded = adapter.load(key);
            expect(loaded).toEqual(data);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('round-trips null and booleans correctly', () => {
      fc.assert(
        fc.property(
          keyArbitrary,
          fc.oneof(fc.constant(null), fc.boolean()),
          (key, data) => {
            adapter.save(key, data);
            const loaded = adapter.load(key);
            expect(loaded).toEqual(data);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
}

runRoundTripTests('LocalStorageAdapter', () => new LocalStorageAdapter());
runRoundTripTests('InMemoryAdapter', () => new InMemoryAdapter());
