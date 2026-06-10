import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { QUESTIONS_PER_SESSION, QUESTION_TIME_LIMIT_SECONDS } from '@/lib/constants';

import { useRaceSession } from './useRaceSession';

// Mock the math-race engine to control question generation
vi.mock('@/features/math/math-race', async () => {
  const actual = await vi.importActual<typeof import('@/features/math/math-race')>(
    '@/features/math/math-race'
  );
  return {
    ...actual,
    generateRaceQuestions: vi.fn(() =>
      Array.from({ length: QUESTIONS_PER_SESSION }, (_, i) => ({
        id: `q${i}`,
        operand1: 2,
        operand2: 3,
        operation: 'addition' as const,
        correctAnswer: 5,
        options: [
          { id: 'opt-0', label: '5', value: 5 },
          { id: 'opt-1', label: '4', value: 4 },
          { id: 'opt-2', label: '6', value: 6 },
          { id: 'opt-3', label: '3', value: 3 },
        ],
        correctOptionId: 'opt-0',
        speechText: 'What is 2 plus 3?',
      }))
    ),
  };
});

// Mock random for opponent movement
vi.mock('@/lib/random', async () => {
  const actual = await vi.importActual<typeof import('@/lib/random')>('@/lib/random');
  return {
    ...actual,
    randomInt: vi.fn((min: number, max: number) => Math.floor((min + max) / 2)),
  };
});

describe('useRaceSession', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes in character-select phase with no character selected', () => {
    const { result } = renderHook(() => useRaceSession());

    expect(result.current.state.phase).toBe('character-select');
    expect(result.current.state.selectedCharacter).toBeNull();
    expect(result.current.state.questions).toHaveLength(0);
    expect(result.current.state.currentQuestionIndex).toBe(0);
    expect(result.current.state.playerPosition).toBe(0);
    expect(result.current.state.placement).toBeNull();
    expect(result.current.state.stickersEarned).toBe(0);
    expect(result.current.state.timeRemaining).toBe(QUESTION_TIME_LIMIT_SECONDS);
    expect(result.current.accuracyPercent).toBe(0);
    expect(result.current.isFirstAttempt).toBe(true);
  });

  it('selectCharacter updates the selected character', () => {
    const { result } = renderHook(() => useRaceSession());

    act(() => {
      result.current.selectCharacter('duck');
    });

    expect(result.current.state.selectedCharacter).toBe('duck');
  });

  it('selectCharacter replaces previous selection', () => {
    const { result } = renderHook(() => useRaceSession());

    act(() => {
      result.current.selectCharacter('duck');
    });
    act(() => {
      result.current.selectCharacter('panda');
    });

    expect(result.current.state.selectedCharacter).toBe('panda');
  });

  it('startRace transitions to racing phase and generates questions', () => {
    const { result } = renderHook(() => useRaceSession());

    act(() => {
      result.current.selectCharacter('rabbit');
    });
    act(() => {
      result.current.startRace();
    });

    expect(result.current.state.phase).toBe('racing');
    expect(result.current.state.questions).toHaveLength(QUESTIONS_PER_SESSION);
    expect(result.current.state.currentQuestionIndex).toBe(0);
    expect(result.current.state.playerPosition).toBe(0);
    expect(result.current.state.firstAttemptResults).toHaveLength(0);
    expect(result.current.state.timeRemaining).toBe(QUESTION_TIME_LIMIT_SECONDS);
  });

  it('submitAnswer returns correct=true and firstAttempt=true on first correct answer', () => {
    const { result } = renderHook(() => useRaceSession());

    act(() => {
      result.current.selectCharacter('duck');
    });
    act(() => {
      result.current.startRace();
    });

    let answerResult: { correct: boolean; firstAttempt: boolean } | undefined;
    act(() => {
      answerResult = result.current.submitAnswer('opt-0');
    });

    expect(answerResult).toEqual({ correct: true, firstAttempt: true });
  });

  it('submitAnswer advances player position on correct answer', () => {
    const { result } = renderHook(() => useRaceSession());

    act(() => {
      result.current.selectCharacter('duck');
    });
    act(() => {
      result.current.startRace();
    });
    act(() => {
      result.current.submitAnswer('opt-0');
    });

    const expectedIncrement = 100 / QUESTIONS_PER_SESSION;
    expect(result.current.state.playerPosition).toBe(expectedIncrement);
  });

  it('submitAnswer does NOT advance player position on incorrect answer and skips to next question', () => {
    const { result } = renderHook(() => useRaceSession());

    act(() => {
      result.current.selectCharacter('duck');
    });
    act(() => {
      result.current.startRace();
    });

    act(() => {
      result.current.submitAnswer('opt-1'); // incorrect
    });

    expect(result.current.state.playerPosition).toBe(0);
    // Wrong answer skips to next question
    expect(result.current.state.currentQuestionIndex).toBe(1);
    // Records as incorrect first attempt
    expect(result.current.state.firstAttemptResults).toEqual([false]);
  });

  it('wrong answer records false in firstAttemptResults and moves to next question', () => {
    const { result } = renderHook(() => useRaceSession());

    act(() => {
      result.current.selectCharacter('duck');
    });
    act(() => {
      result.current.startRace();
    });

    let incorrectResult: { correct: boolean; firstAttempt: boolean } | undefined;
    act(() => {
      incorrectResult = result.current.submitAnswer('opt-1');
    });
    expect(incorrectResult).toEqual({ correct: false, firstAttempt: false });

    // Should have moved to question 2
    expect(result.current.state.currentQuestionIndex).toBe(1);
    expect(result.current.state.firstAttemptResults).toEqual([false]);
    // Timer should be reset for next question
    expect(result.current.state.timeRemaining).toBe(QUESTION_TIME_LIMIT_SECONDS);
  });

  it('advanceToNextQuestion increments currentQuestionIndex', () => {
    const { result } = renderHook(() => useRaceSession());

    act(() => {
      result.current.selectCharacter('duck');
    });
    act(() => {
      result.current.startRace();
    });
    act(() => {
      result.current.submitAnswer('opt-0');
    });
    act(() => {
      result.current.advanceToNextQuestion();
    });

    expect(result.current.state.currentQuestionIndex).toBe(1);
  });

  it('transitions to results phase after final correct answer', () => {
    const { result } = renderHook(() => useRaceSession());

    act(() => {
      result.current.selectCharacter('duck');
    });
    act(() => {
      result.current.startRace();
    });

    // Answer all questions correctly
    for (let i = 0; i < QUESTIONS_PER_SESSION; i++) {
      act(() => {
        result.current.submitAnswer('opt-0');
      });
      // Advance to next question (except after final)
      if (i < QUESTIONS_PER_SESSION - 1) {
        act(() => {
          result.current.advanceToNextQuestion();
        });
      }
    }

    expect(result.current.state.phase).toBe('results');
    expect(result.current.state.placement).not.toBeNull();
    expect(result.current.state.stickersEarned).toBeGreaterThanOrEqual(0);
  });

  it('calculates 1st placement and 3 stickers when all answers are first-attempt correct', () => {
    const { result } = renderHook(() => useRaceSession());

    act(() => {
      result.current.selectCharacter('duck');
    });
    act(() => {
      result.current.startRace();
    });

    // All correct on first attempt → 100% accuracy → 1st place → 3 stickers
    for (let i = 0; i < QUESTIONS_PER_SESSION; i++) {
      act(() => {
        result.current.submitAnswer('opt-0');
      });
      if (i < QUESTIONS_PER_SESSION - 1) {
        act(() => {
          result.current.advanceToNextQuestion();
        });
      }
    }

    expect(result.current.state.placement).toBe(1);
    expect(result.current.state.stickersEarned).toBe(3);
    expect(result.current.accuracyPercent).toBe(100);
  });

  it('calculates 3rd placement and 0 stickers when all answers are wrong', () => {
    const { result } = renderHook(() => useRaceSession());

    act(() => {
      result.current.selectCharacter('duck');
    });
    act(() => {
      result.current.startRace();
    });

    // Wrong answer on each question — each skips to next automatically
    for (let i = 0; i < QUESTIONS_PER_SESSION; i++) {
      act(() => {
        result.current.submitAnswer('opt-1'); // incorrect → skips to next
      });
    }

    expect(result.current.state.placement).toBe(3);
    expect(result.current.state.stickersEarned).toBe(0);
    expect(result.current.accuracyPercent).toBe(0);
  });

  it('computes accuracyPercent correctly during the race', () => {
    const { result } = renderHook(() => useRaceSession());

    act(() => {
      result.current.selectCharacter('duck');
    });
    act(() => {
      result.current.startRace();
    });

    // First question: correct on first attempt
    act(() => {
      result.current.submitAnswer('opt-0');
    });
    expect(result.current.accuracyPercent).toBe(100);

    // Advance and answer wrong (skips automatically)
    act(() => {
      result.current.advanceToNextQuestion();
    });
    act(() => {
      result.current.submitAnswer('opt-1'); // incorrect → auto-skip
    });
    expect(result.current.accuracyPercent).toBe(50); // 1/2 = 50%
  });

  it('timer counts down during racing phase', () => {
    const { result } = renderHook(() => useRaceSession());

    act(() => {
      result.current.selectCharacter('duck');
    });
    act(() => {
      result.current.startRace();
    });

    expect(result.current.state.timeRemaining).toBe(QUESTION_TIME_LIMIT_SECONDS);

    // Advance time by 3 seconds
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.state.timeRemaining).toBe(QUESTION_TIME_LIMIT_SECONDS - 3);
  });

  it('timer reaching 0 skips the question', () => {
    const { result } = renderHook(() => useRaceSession());

    act(() => {
      result.current.selectCharacter('duck');
    });
    act(() => {
      result.current.startRace();
    });

    // Let the timer run out
    act(() => {
      vi.advanceTimersByTime(QUESTION_TIME_LIMIT_SECONDS * 1000 + 100);
    });

    // Should have skipped to next question
    expect(result.current.state.currentQuestionIndex).toBe(1);
    expect(result.current.state.firstAttemptResults).toEqual([false]);
    expect(result.current.state.playerPosition).toBe(0); // no movement on timeout
  });

  it('timer resets when advancing to next question', () => {
    const { result } = renderHook(() => useRaceSession());

    act(() => {
      result.current.selectCharacter('duck');
    });
    act(() => {
      result.current.startRace();
    });

    // Let some time pass
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.state.timeRemaining).toBe(QUESTION_TIME_LIMIT_SECONDS - 3);

    // Answer correctly
    act(() => {
      result.current.submitAnswer('opt-0');
    });

    // Timer should reset for next question
    expect(result.current.state.timeRemaining).toBe(QUESTION_TIME_LIMIT_SECONDS);
  });

  it('reset returns to character-select with clean state', () => {
    const { result } = renderHook(() => useRaceSession());

    act(() => {
      result.current.selectCharacter('duck');
    });
    act(() => {
      result.current.startRace();
    });
    act(() => {
      result.current.submitAnswer('opt-0');
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.state.phase).toBe('character-select');
    expect(result.current.state.selectedCharacter).toBeNull();
    expect(result.current.state.questions).toHaveLength(0);
    expect(result.current.state.currentQuestionIndex).toBe(0);
    expect(result.current.state.playerPosition).toBe(0);
    expect(result.current.state.firstAttemptResults).toHaveLength(0);
    expect(result.current.state.placement).toBeNull();
    expect(result.current.state.stickersEarned).toBe(0);
    expect(result.current.state.timeRemaining).toBe(QUESTION_TIME_LIMIT_SECONDS);
    expect(result.current.accuracyPercent).toBe(0);
    expect(result.current.isFirstAttempt).toBe(true);
  });

  it('wrong answer on final question transitions to results', () => {
    const { result } = renderHook(() => useRaceSession());

    act(() => {
      result.current.selectCharacter('duck');
    });
    act(() => {
      result.current.startRace();
    });

    // Answer first 4 questions correctly
    for (let i = 0; i < QUESTIONS_PER_SESSION - 1; i++) {
      act(() => {
        result.current.submitAnswer('opt-0');
      });
      act(() => {
        result.current.advanceToNextQuestion();
      });
    }

    // Wrong answer on final question
    act(() => {
      result.current.submitAnswer('opt-1');
    });

    expect(result.current.state.phase).toBe('results');
    expect(result.current.state.placement).not.toBeNull();
  });
});
