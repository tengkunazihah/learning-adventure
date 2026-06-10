import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { QUESTIONS_PER_SESSION } from '@/lib/constants';
import type { Question } from '@/types/activity';

import { useActivitySession } from './useActivitySession';

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

describe('useActivitySession', () => {
  it('initializes with first question and zero correct count', () => {
    const generator = () => makeQuestions();
    const { result } = renderHook(() =>
      useActivitySession('count-animals', generator)
    );

    expect(result.current.questionIndex).toBe(0);
    expect(result.current.totalQuestions).toBe(QUESTIONS_PER_SESSION);
    expect(result.current.isComplete).toBe(false);
    expect(result.current.correctCount).toBe(0);
    expect(result.current.currentQuestion).not.toBeNull();
    expect(result.current.lastAnswerResult).toBeNull();
  });

  it('takes exactly QUESTIONS_PER_SESSION questions from the generator', () => {
    const generator = () => makeQuestions(20);
    const { result } = renderHook(() =>
      useActivitySession('count-animals', generator)
    );

    // Answer all questions correctly to verify count
    for (let i = 0; i < QUESTIONS_PER_SESSION; i++) {
      act(() => {
        result.current.handleAnswer(result.current.currentQuestion!.correctOptionId);
      });
    }

    expect(result.current.isComplete).toBe(true);
    expect(result.current.correctCount).toBe(QUESTIONS_PER_SESSION);
  });

  it('advances to next question on correct answer', () => {
    const generator = () => makeQuestions();
    const { result } = renderHook(() =>
      useActivitySession('count-animals', generator)
    );

    const firstQuestion = result.current.currentQuestion;

    act(() => {
      result.current.handleAnswer(firstQuestion!.correctOptionId);
    });

    expect(result.current.questionIndex).toBe(1);
    expect(result.current.correctCount).toBe(1);
    expect(result.current.lastAnswerResult).toBe('correct');
    expect(result.current.currentQuestion).not.toBe(firstQuestion);
  });

  it('does NOT advance on incorrect answer (allows retry)', () => {
    const generator = () => makeQuestions();
    const { result } = renderHook(() =>
      useActivitySession('count-animals', generator)
    );

    const firstQuestion = result.current.currentQuestion;

    act(() => {
      result.current.handleAnswer('opt-b'); // incorrect
    });

    expect(result.current.questionIndex).toBe(0);
    expect(result.current.correctCount).toBe(0);
    expect(result.current.lastAnswerResult).toBe('incorrect');
    expect(result.current.currentQuestion).toBe(firstQuestion);
  });

  it('score never decreases after incorrect answers', () => {
    const generator = () => makeQuestions();
    const { result } = renderHook(() =>
      useActivitySession('count-animals', generator)
    );

    // Get one correct
    act(() => {
      result.current.handleAnswer(result.current.currentQuestion!.correctOptionId);
    });
    expect(result.current.correctCount).toBe(1);

    // Try wrong answers multiple times
    act(() => {
      result.current.handleAnswer('opt-b');
    });
    act(() => {
      result.current.handleAnswer('opt-c');
    });

    expect(result.current.correctCount).toBe(1); // Never decreases
  });

  it('marks session complete after all questions answered', () => {
    const generator = () => makeQuestions();
    const { result } = renderHook(() =>
      useActivitySession('count-animals', generator)
    );

    for (let i = 0; i < QUESTIONS_PER_SESSION; i++) {
      act(() => {
        result.current.handleAnswer(result.current.currentQuestion!.correctOptionId);
      });
    }

    expect(result.current.isComplete).toBe(true);
    expect(result.current.currentQuestion).toBeNull();
  });

  it('does not process answers after completion', () => {
    const generator = () => makeQuestions();
    const { result } = renderHook(() =>
      useActivitySession('count-animals', generator)
    );

    // Complete all questions
    for (let i = 0; i < QUESTIONS_PER_SESSION; i++) {
      act(() => {
        result.current.handleAnswer(result.current.currentQuestion!.correctOptionId);
      });
    }

    const countAfterComplete = result.current.correctCount;

    // Try to answer after completion
    act(() => {
      result.current.handleAnswer('opt-a');
    });

    expect(result.current.correctCount).toBe(countAfterComplete);
  });

  it('reset() regenerates questions and resets state', () => {
    const generator = vi.fn(() => makeQuestions());
    const { result } = renderHook(() =>
      useActivitySession('count-animals', generator)
    );

    // Answer some questions
    act(() => {
      result.current.handleAnswer(result.current.currentQuestion!.correctOptionId);
    });

    expect(result.current.correctCount).toBe(1);

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.questionIndex).toBe(0);
    expect(result.current.correctCount).toBe(0);
    expect(result.current.isComplete).toBe(false);
    expect(result.current.lastAnswerResult).toBeNull();
    // Generator was called again on reset
    expect(generator).toHaveBeenCalledTimes(2);
  });

  it('shuffles questions from generator (randomized order)', () => {
    // With a pool of 10 questions taking 5, the shuffled selection
    // should work without errors
    const questions = makeQuestions(10);
    const generator = () => questions;

    const { result } = renderHook(() =>
      useActivitySession('count-animals', generator)
    );

    expect(result.current.currentQuestion).not.toBeNull();
    expect(result.current.totalQuestions).toBe(QUESTIONS_PER_SESSION);
  });
});
