import { describe, it, expect } from 'vitest';
import {
  generateRaceQuestion,
  generateRaceDistractors,
  generateRaceQuestions,
  calculatePlacement,
  calculateStickerReward,
  getPlayerIncrement,
  calculateOpponentPositions,
} from './math-race';

describe('generateRaceDistractors', () => {
  it('generates the requested number of distractors', () => {
    const distractors = generateRaceDistractors(10, 3);
    expect(distractors).toHaveLength(3);
  });

  it('does not include the correct answer', () => {
    for (let i = 0; i < 50; i++) {
      const correctAnswer = 5;
      const distractors = generateRaceDistractors(correctAnswer, 3);
      expect(distractors).not.toContain(correctAnswer);
    }
  });

  it('generates values clamped to [0, 20]', () => {
    // Test near lower boundary
    const lowDistractors = generateRaceDistractors(0, 3);
    for (const d of lowDistractors) {
      expect(d).toBeGreaterThanOrEqual(0);
      expect(d).toBeLessThanOrEqual(20);
    }

    // Test near upper boundary
    const highDistractors = generateRaceDistractors(20, 3);
    for (const d of highDistractors) {
      expect(d).toBeGreaterThanOrEqual(0);
      expect(d).toBeLessThanOrEqual(20);
    }
  });

  it('generates unique distractor values', () => {
    for (let i = 0; i < 50; i++) {
      const distractors = generateRaceDistractors(10, 3);
      const unique = new Set(distractors);
      expect(unique.size).toBe(3);
    }
  });

  it('expands range when near boundary with fewer than 3 candidates', () => {
    // correctAnswer = 0: initial range [0,3], excluding 0 gives [1,2,3] — exactly 3
    const distractors = generateRaceDistractors(0, 3);
    expect(distractors).toHaveLength(3);
    for (const d of distractors) {
      expect(d).toBeGreaterThanOrEqual(0);
      expect(d).toBeLessThanOrEqual(20);
    }
  });
});

describe('generateRaceQuestion', () => {
  it('produces a question with valid operands in [1, 10]', () => {
    for (let i = 0; i < 50; i++) {
      const q = generateRaceQuestion();
      expect(q.operand1).toBeGreaterThanOrEqual(1);
      expect(q.operand1).toBeLessThanOrEqual(10);
      expect(q.operand2).toBeGreaterThanOrEqual(1);
      expect(q.operand2).toBeLessThanOrEqual(10);
    }
  });

  it('produces correct answer matching the operation', () => {
    for (let i = 0; i < 50; i++) {
      const q = generateRaceQuestion();
      if (q.operation === 'addition') {
        expect(q.correctAnswer).toBe(q.operand1 + q.operand2);
      } else {
        expect(q.correctAnswer).toBe(q.operand1 - q.operand2);
      }
    }
  });

  it('ensures subtraction result is non-negative', () => {
    for (let i = 0; i < 100; i++) {
      const q = generateRaceQuestion();
      if (q.operation === 'subtraction') {
        expect(q.correctAnswer).toBeGreaterThanOrEqual(0);
        expect(q.operand1).toBeGreaterThanOrEqual(q.operand2);
      }
    }
  });

  it('generates exactly 4 options with unique values', () => {
    for (let i = 0; i < 50; i++) {
      const q = generateRaceQuestion();
      expect(q.options).toHaveLength(4);
      const values = q.options.map((o) => o.value);
      const unique = new Set(values);
      expect(unique.size).toBe(4);
    }
  });

  it('includes the correct answer in the options', () => {
    for (let i = 0; i < 50; i++) {
      const q = generateRaceQuestion();
      const correctOpt = q.options.find((o) => o.id === q.correctOptionId);
      expect(correctOpt).toBeDefined();
      expect(correctOpt!.value).toBe(q.correctAnswer);
    }
  });

  it('generates speechText in correct format', () => {
    for (let i = 0; i < 50; i++) {
      const q = generateRaceQuestion();
      const word = q.operation === 'addition' ? 'plus' : 'minus';
      expect(q.speechText).toBe(
        `What is ${q.operand1} ${word} ${q.operand2}?`
      );
    }
  });

  it('generates operation as addition or subtraction', () => {
    const operations = new Set<string>();
    for (let i = 0; i < 100; i++) {
      const q = generateRaceQuestion();
      operations.add(q.operation);
    }
    expect(operations.has('addition')).toBe(true);
    expect(operations.has('subtraction')).toBe(true);
  });
});

describe('generateRaceQuestions', () => {
  it('returns the requested number of questions', () => {
    const questions = generateRaceQuestions(5);
    expect(questions).toHaveLength(5);
  });

  it('returns an empty array for count 0', () => {
    const questions = generateRaceQuestions(0);
    expect(questions).toHaveLength(0);
  });

  it('each question is valid', () => {
    const questions = generateRaceQuestions(5);
    for (const q of questions) {
      expect(q.operand1).toBeGreaterThanOrEqual(1);
      expect(q.operand1).toBeLessThanOrEqual(10);
      expect(q.operand2).toBeGreaterThanOrEqual(1);
      expect(q.operand2).toBeLessThanOrEqual(10);
      expect(q.options).toHaveLength(4);
      expect(['addition', 'subtraction']).toContain(q.operation);
    }
  });
});


describe('calculatePlacement', () => {
  it('returns 1 for accuracy >= 75', () => {
    expect(calculatePlacement(75)).toBe(1);
    expect(calculatePlacement(100)).toBe(1);
    expect(calculatePlacement(80)).toBe(1);
  });

  it('returns 2 for accuracy >= 50 and < 75', () => {
    expect(calculatePlacement(50)).toBe(2);
    expect(calculatePlacement(74)).toBe(2);
    expect(calculatePlacement(60)).toBe(2);
  });

  it('returns 3 for accuracy < 50', () => {
    expect(calculatePlacement(0)).toBe(3);
    expect(calculatePlacement(49)).toBe(3);
    expect(calculatePlacement(25)).toBe(3);
  });
});

describe('calculateStickerReward', () => {
  it('returns 3 for 1st place', () => {
    expect(calculateStickerReward(1)).toBe(3);
  });

  it('returns 1 for 2nd place', () => {
    expect(calculateStickerReward(2)).toBe(1);
  });

  it('returns 0 for 3rd place', () => {
    expect(calculateStickerReward(3)).toBe(0);
  });
});

describe('getPlayerIncrement', () => {
  it('returns 20 for 5 questions', () => {
    expect(getPlayerIncrement(5)).toBe(20);
  });

  it('returns 10 for 10 questions', () => {
    expect(getPlayerIncrement(10)).toBe(10);
  });
});

describe('calculateOpponentPositions', () => {
  it('returns both opponents below player for 1st place (accuracy >= 75)', () => {
    for (let i = 0; i < 50; i++) {
      const result = calculateOpponentPositions(80, 5);
      expect(result.opponent1).toBeLessThan(80);
      expect(result.opponent2).toBeLessThan(80);
      expect(result.opponent1).toBeGreaterThanOrEqual(0);
      expect(result.opponent2).toBeGreaterThanOrEqual(0);
      expect(result.opponent1).toBeLessThanOrEqual(100);
      expect(result.opponent2).toBeLessThanOrEqual(100);
    }
  });

  it('returns one opponent above and one below for 2nd place (50-74%)', () => {
    for (let i = 0; i < 50; i++) {
      const result = calculateOpponentPositions(60, 5);
      const above = [result.opponent1, result.opponent2].filter(p => p > 60);
      const below = [result.opponent1, result.opponent2].filter(p => p < 60);
      expect(above.length).toBe(1);
      expect(below.length).toBe(1);
      expect(result.opponent1).toBeGreaterThanOrEqual(0);
      expect(result.opponent2).toBeGreaterThanOrEqual(0);
      expect(result.opponent1).toBeLessThanOrEqual(100);
      expect(result.opponent2).toBeLessThanOrEqual(100);
    }
  });

  it('returns both opponents above player for 3rd place (accuracy < 50)', () => {
    for (let i = 0; i < 50; i++) {
      const result = calculateOpponentPositions(20, 5);
      expect(result.opponent1).toBeGreaterThan(20);
      expect(result.opponent2).toBeGreaterThan(20);
      expect(result.opponent1).toBeGreaterThanOrEqual(0);
      expect(result.opponent2).toBeGreaterThanOrEqual(0);
      expect(result.opponent1).toBeLessThanOrEqual(100);
      expect(result.opponent2).toBeLessThanOrEqual(100);
    }
  });

  it('handles edge case: accuracy = 100 (1st place, both below)', () => {
    for (let i = 0; i < 20; i++) {
      const result = calculateOpponentPositions(100, 5);
      expect(result.opponent1).toBeLessThan(100);
      expect(result.opponent2).toBeLessThan(100);
      expect(result.opponent1).toBeGreaterThanOrEqual(0);
      expect(result.opponent2).toBeGreaterThanOrEqual(0);
    }
  });

  it('handles edge case: accuracy = 0 (3rd place, both above)', () => {
    for (let i = 0; i < 20; i++) {
      const result = calculateOpponentPositions(0, 5);
      expect(result.opponent1).toBeGreaterThan(0);
      expect(result.opponent2).toBeGreaterThan(0);
      expect(result.opponent1).toBeLessThanOrEqual(100);
      expect(result.opponent2).toBeLessThanOrEqual(100);
    }
  });

  it('positions are always in [0, 100]', () => {
    const accuracies = [0, 10, 25, 40, 50, 60, 74, 75, 80, 90, 100];
    for (const accuracy of accuracies) {
      for (let i = 0; i < 20; i++) {
        const result = calculateOpponentPositions(accuracy, 5);
        expect(result.opponent1).toBeGreaterThanOrEqual(0);
        expect(result.opponent1).toBeLessThanOrEqual(100);
        expect(result.opponent2).toBeGreaterThanOrEqual(0);
        expect(result.opponent2).toBeLessThanOrEqual(100);
      }
    }
  });
});
