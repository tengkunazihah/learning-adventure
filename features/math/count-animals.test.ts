import { describe, it, expect } from 'vitest';
import {
  generateCountAnimalsQuestion,
  generateCountAnimalsQuestions,
} from './count-animals';
import { QUESTIONS_PER_SESSION, MIN_COUNT, MAX_COUNT, ANSWER_OPTIONS_COUNT } from '@/lib/constants';

describe('generateCountAnimalsQuestion', () => {
  it('returns a question with type count-animals', () => {
    const question = generateCountAnimalsQuestion();
    expect(question.type).toBe('count-animals');
  });

  it('returns exactly 4 answer options', () => {
    const question = generateCountAnimalsQuestion();
    expect(question.options).toHaveLength(ANSWER_OPTIONS_COUNT);
  });

  it('has all unique option values', () => {
    const question = generateCountAnimalsQuestion();
    const values = question.options.map((o) => o.value);
    expect(new Set(values).size).toBe(values.length);
  });

  it('includes the correct answer in options', () => {
    const question = generateCountAnimalsQuestion();
    const correctOption = question.options.find(
      (o) => o.id === question.correctOptionId
    );
    expect(correctOption).toBeDefined();
  });

  it('correct answer value is between 1 and 10', () => {
    const question = generateCountAnimalsQuestion();
    const correctOption = question.options.find(
      (o) => o.id === question.correctOptionId
    )!;
    expect(correctOption.value).toBeGreaterThanOrEqual(MIN_COUNT);
    expect(correctOption.value).toBeLessThanOrEqual(MAX_COUNT);
  });

  it('all option values are between 1 and 10', () => {
    const question = generateCountAnimalsQuestion();
    for (const option of question.options) {
      expect(option.value).toBeGreaterThanOrEqual(MIN_COUNT);
      expect(option.value).toBeLessThanOrEqual(MAX_COUNT);
    }
  });

  it('distractors are within ±3 of correct answer', () => {
    // Run multiple times to increase confidence
    for (let i = 0; i < 50; i++) {
      const question = generateCountAnimalsQuestion();
      const correctOption = question.options.find(
        (o) => o.id === question.correctOptionId
      )!;
      const correctValue = correctOption.value as number;

      for (const option of question.options) {
        const diff = Math.abs((option.value as number) - correctValue);
        expect(diff).toBeLessThanOrEqual(3);
      }
    }
  });

  it('speechText is "How many animals do you see?"', () => {
    const question = generateCountAnimalsQuestion();
    expect(question.speechText).toBe('How many animals do you see?');
  });

  it('has a non-empty prompt containing the animal name', () => {
    const question = generateCountAnimalsQuestion();
    expect(question.prompt.length).toBeGreaterThan(0);
    expect(question.prompt).toContain('Count the');
  });
});

describe('generateCountAnimalsQuestions', () => {
  it('returns QUESTIONS_PER_SESSION + 5 questions', () => {
    const questions = generateCountAnimalsQuestions();
    expect(questions).toHaveLength(QUESTIONS_PER_SESSION + 5);
  });

  it('all questions have unique IDs', () => {
    const questions = generateCountAnimalsQuestions();
    const ids = questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
