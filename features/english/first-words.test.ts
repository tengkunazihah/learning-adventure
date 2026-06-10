import { describe, it, expect } from 'vitest';
import { FIRST_WORDS_DATA } from './first-words';

describe('FIRST_WORDS_DATA', () => {
  const REQUIRED_WORDS = [
    'Cat',
    'Dog',
    'Ball',
    'Car',
    'Apple',
    'Fish',
    'Tree',
    'Bird',
    'Book',
    'Sun',
  ];

  it('contains exactly 10 entries', () => {
    expect(FIRST_WORDS_DATA).toHaveLength(10);
  });

  it.each(REQUIRED_WORDS)('includes the word "%s"', (word) => {
    const found = FIRST_WORDS_DATA.find((entry) => entry.word === word);
    expect(found).toBeDefined();
  });

  it('each entry has a non-empty emoji', () => {
    for (const entry of FIRST_WORDS_DATA) {
      expect(entry.emoji.length).toBeGreaterThan(0);
    }
  });

  it('each entry has a non-empty animation', () => {
    for (const entry of FIRST_WORDS_DATA) {
      expect(entry.animation.length).toBeGreaterThan(0);
    }
  });
});
