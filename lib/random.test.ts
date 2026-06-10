import { describe, it, expect } from 'vitest';
import { randomInt, shuffle, randomPick, randomPickN } from './random';

describe('randomInt', () => {
  it('returns a value within the specified range', () => {
    for (let i = 0; i < 100; i++) {
      const result = randomInt(1, 10);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(10);
    }
  });

  it('returns the only possible value when min equals max', () => {
    expect(randomInt(5, 5)).toBe(5);
  });

  it('returns an integer', () => {
    for (let i = 0; i < 50; i++) {
      const result = randomInt(1, 100);
      expect(Number.isInteger(result)).toBe(true);
    }
  });
});

describe('shuffle', () => {
  it('returns an array with the same length', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    expect(result).toHaveLength(input.length);
  });

  it('contains all original elements', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    expect(result.sort()).toEqual([...input].sort());
  });

  it('does not mutate the input array', () => {
    const input = [1, 2, 3, 4, 5];
    const copy = [...input];
    shuffle(input);
    expect(input).toEqual(copy);
  });

  it('returns an empty array for empty input', () => {
    expect(shuffle([])).toEqual([]);
  });
});

describe('randomPick', () => {
  it('returns an element from the array', () => {
    const input = ['a', 'b', 'c'];
    for (let i = 0; i < 50; i++) {
      expect(input).toContain(randomPick(input));
    }
  });

  it('throws on empty array', () => {
    expect(() => randomPick([])).toThrow('Cannot pick from an empty array');
  });
});

describe('randomPickN', () => {
  it('returns n unique elements from the array', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const result = randomPickN(input, 3);
    expect(result).toHaveLength(3);
    expect(new Set(result).size).toBe(3);
    result.forEach((item) => expect(input).toContain(item));
  });

  it('returns all elements when n equals array length', () => {
    const input = [1, 2, 3];
    const result = randomPickN(input, 3);
    expect(result.sort()).toEqual([...input].sort());
  });

  it('throws when n exceeds array length', () => {
    expect(() => randomPickN([1, 2], 5)).toThrow(
      'Cannot pick 5 unique elements from an array of length 2'
    );
  });
});
