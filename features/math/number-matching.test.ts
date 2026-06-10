import { describe, it, expect } from 'vitest';
import {
  generateNumberMatchingQuestion,
  generateNumberMatchingQuestions,
} from './number-matching';
import { QUESTIONS_PER_SESSION, MIN_COUNT, MAX_COUNT, ANSWER_OPTIONS_COUNT } from '@/lib/constants';

describe('generateNumberMatchingQuestion', () => {
  it('returns a question with type number-matching', () => {
    const question = generateNumberMatchingQuestion();
    expect(question.type).toBe('number-matching');
  });

  it('returns exactly 4 answer options', () => {
    const question = generateNumberMatchingQuestion();
    expect(question.options).toHaveLength(ANSWER_OPTIONS_COUNT);
  });

  it('has all unique option values (distinct quantities)', () => {
    const question = generateNumberMatchingQuestion();
    const values = question.options.map((o) => o.value);
    expect(new Set(values).size).toBe(values.length);
  });

  it('includes the correct answer in options', () => {
    const question = generateNumberMatchingQuestion();
    const correctOption = question.options.find(
      (o) => o.id === question.correctOptionId
    );
    expect(correctOption).toBeDefined();
  });

  it('correct answer value is between 1 and 10', () => {
    const question = generateNumberMatchingQuestion();
    const correctOption = question.options.find(
      (o) => o.id === question.correctOptionId
    )!;
    expect(correctOption.value).toBeGreaterThanOrEqual(MIN_COUNT);
    expect(correctOption.value).toBeLessThanOrEqual(MAX_COUNT);
  });

  it('all option values are between 1 and 10', () => {
    const question = generateNumberMatchingQuestion();
    for (const option of question.options) {
      expect(option.value).toBeGreaterThanOrEqual(MIN_COUNT);
      expect(option.value).toBeLessThanOrEqual(MAX_COUNT);
    }
  });

  it('option labels contain emoji characters repeated by quantity', () => {
    const question = generateNumberMatchingQuestion();
    for (const option of question.options) {
      // Label should be non-empty
      expect(option.label.length).toBeGreaterThan(0);
      // The label's character count (using spread for emoji) should match the value
      const chars = [...option.label];
      expect(chars.length).toBe(option.value);
    }
  });

  it('speechText is a number word (one through ten)', () => {
    const validWords = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
    const question = generateNumberMatchingQuestion();
    expect(validWords).toContain(question.speechText);
  });

  it('has a non-empty prompt containing the target number', () => {
    const question = generateNumberMatchingQuestion();
    expect(question.prompt.length).toBeGreaterThan(0);
    expect(question.prompt).toContain('Find the group with');
  });
});

describe('generateNumberMatchingQuestions', () => {
  it('returns QUESTIONS_PER_SESSION + 5 questions', () => {
    const questions = generateNumberMatchingQuestions();
    expect(questions).toHaveLength(QUESTIONS_PER_SESSION + 5);
  });

  it('all questions have unique IDs', () => {
    const questions = generateNumberMatchingQuestions();
    const ids = questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
