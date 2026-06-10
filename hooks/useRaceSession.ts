'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { QUESTIONS_PER_SESSION, QUESTION_TIME_LIMIT_SECONDS } from '@/lib/constants';
import type { RaceCharacter, RaceQuestion, Placement } from '@/features/math/math-race';
import {
  generateRaceQuestions,
  calculatePlacement,
  calculateStickerReward,
  getPlayerIncrement,
  calculateOpponentPositions,
} from '@/features/math/math-race';
import { randomInt } from '@/lib/random';

export interface RaceState {
  phase: 'character-select' | 'racing' | 'results';
  selectedCharacter: RaceCharacter | null;
  questions: RaceQuestion[];
  currentQuestionIndex: number;
  firstAttemptResults: boolean[]; // true = correct on first attempt
  playerPosition: number;        // 0–100 percentage
  opponent1Position: number;     // 0–100 percentage
  opponent2Position: number;     // 0–100 percentage
  placement: Placement | null;
  stickersEarned: number;
  timeRemaining: number;         // seconds remaining for current question
}

export interface UseRaceSessionReturn {
  state: RaceState;
  selectCharacter: (character: RaceCharacter) => void;
  startRace: () => void;
  submitAnswer: (optionId: string) => { correct: boolean; firstAttempt: boolean };
  advanceToNextQuestion: () => void;
  skipQuestion: () => void;
  reset: () => void;
  accuracyPercent: number;
  isFirstAttempt: boolean;
}

const initialState: RaceState = {
  phase: 'character-select',
  selectedCharacter: null,
  questions: [],
  currentQuestionIndex: 0,
  firstAttemptResults: [],
  playerPosition: 0,
  opponent1Position: 0,
  opponent2Position: 0,
  placement: null,
  stickersEarned: 0,
  timeRemaining: QUESTION_TIME_LIMIT_SECONDS,
};

/**
 * Manages the race session state including character selection, question flow,
 * answer tracking, player/opponent positions, and placement calculation.
 *
 * - Tracks first-attempt accuracy per question
 * - Advances player position on correct answer
 * - On wrong answer: skips to next question, no movement, records as incorrect
 * - Timer per question with auto-skip on timeout
 * - Opponents move randomly during the race simulating answering
 * - Calculates placement and stickers on final question
 */
export function useRaceSession(): UseRaceSessionReturn {
  const [state, setState] = useState<RaceState>(initialState);
  // Track whether any incorrect answer has been given for the current question
  const [hasIncorrectAttempt, setHasIncorrectAttempt] = useState(false);

  // Timer ref
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup timer
  const clearAllTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  const selectCharacter = useCallback((character: RaceCharacter) => {
    setState((prev) => ({
      ...prev,
      selectedCharacter: character,
    }));
  }, []);

  /**
   * Simulate opponents answering the current question.
   * Each opponent has a random chance of getting it right.
   * Opponent 1 is stronger (70% correct), Opponent 2 is weaker (50% correct).
   * If correct, they move forward by the standard increment (with slight variation).
   * If wrong, they don't move — just like the player.
   */
  const moveOpponents = useCallback(() => {
    const increment = getPlayerIncrement(QUESTIONS_PER_SESSION);

    setState((prev) => {
      if (prev.phase !== 'racing') return prev;

      // Opponent 1: 70% chance of answering correctly
      const opp1Correct = randomInt(1, 10) <= 7;
      const newOpp1Pos = opp1Correct
        ? Math.min(100, prev.opponent1Position + increment)
        : prev.opponent1Position;

      // Opponent 2: 50% chance of answering correctly
      const opp2Correct = randomInt(1, 10) <= 5;
      const newOpp2Pos = opp2Correct
        ? Math.min(100, prev.opponent2Position + increment)
        : prev.opponent2Position;

      return {
        ...prev,
        opponent1Position: newOpp1Pos,
        opponent2Position: newOpp2Pos,
      };
    });
  }, []);

  /**
   * Finalize the race: calculate placement and opponent final positions.
   */
  const finalizeRace = useCallback((newFirstAttemptResults: boolean[], newPlayerPosition: number) => {
    const correctFirstAttempts = newFirstAttemptResults.filter(Boolean).length;
    const accuracy = (correctFirstAttempts / QUESTIONS_PER_SESSION) * 100;
    const placement = calculatePlacement(accuracy);
    const stickersEarned = calculateStickerReward(placement);
    const { opponent1, opponent2 } = calculateOpponentPositions(
      accuracy,
      QUESTIONS_PER_SESSION
    );

    clearAllTimers();

    setState((prev) => ({
      ...prev,
      firstAttemptResults: newFirstAttemptResults,
      playerPosition: newPlayerPosition,
      opponent1Position: opponent1,
      opponent2Position: opponent2,
      placement,
      stickersEarned,
      phase: 'results',
    }));
  }, [clearAllTimers]);

  /**
   * Skip the current question (wrong answer or timeout).
   * Records as incorrect, does not move the player.
   */
  const skipQuestion = useCallback(() => {
    setState((prev) => {
      const newFirstAttemptResults = [...prev.firstAttemptResults, false];
      const isFinalQuestion = prev.currentQuestionIndex === QUESTIONS_PER_SESSION - 1;

      if (isFinalQuestion) {
        // Will finalize in a separate call
        return { ...prev, firstAttemptResults: newFirstAttemptResults };
      }

      return {
        ...prev,
        firstAttemptResults: newFirstAttemptResults,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        timeRemaining: QUESTION_TIME_LIMIT_SECONDS,
      };
    });

    setHasIncorrectAttempt(false);
  }, []);

  // Handle timeout-triggered skip and finalization
  const handleTimeout = useCallback(() => {
    // Opponents also "answer" when the timer expires
    moveOpponents();

    setState((prev) => {
      const newFirstAttemptResults = [...prev.firstAttemptResults, false];
      const isFinalQuestion = prev.currentQuestionIndex === QUESTIONS_PER_SESSION - 1;

      if (isFinalQuestion) {
        const correctFirstAttempts = newFirstAttemptResults.filter(Boolean).length;
        const accuracy = (correctFirstAttempts / QUESTIONS_PER_SESSION) * 100;
        const placement = calculatePlacement(accuracy);
        const stickersEarned = calculateStickerReward(placement);
        const { opponent1, opponent2 } = calculateOpponentPositions(
          accuracy,
          QUESTIONS_PER_SESSION
        );

        return {
          ...prev,
          firstAttemptResults: newFirstAttemptResults,
          opponent1Position: opponent1,
          opponent2Position: opponent2,
          placement,
          stickersEarned,
          phase: 'results' as const,
        };
      }

      return {
        ...prev,
        firstAttemptResults: newFirstAttemptResults,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        timeRemaining: QUESTION_TIME_LIMIT_SECONDS,
      };
    });

    setHasIncorrectAttempt(false);
  }, [moveOpponents]);

  // Question countdown timer
  useEffect(() => {
    if (state.phase !== 'racing') return;

    // Clear previous timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setState((prev) => {
        if (prev.phase !== 'racing') return prev;
        const newTime = prev.timeRemaining - 1;
        if (newTime <= 0) {
          // Time's up — will be handled by the timeout effect
          return { ...prev, timeRemaining: 0 };
        }
        return { ...prev, timeRemaining: newTime };
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [state.phase, state.currentQuestionIndex]);

  // Timeout handler — skip when timer hits 0
  useEffect(() => {
    if (state.phase === 'racing' && state.timeRemaining === 0) {
      handleTimeout();
    }
  }, [state.timeRemaining, state.phase, handleTimeout]);

  const startRace = useCallback(() => {
    const questions = generateRaceQuestions(QUESTIONS_PER_SESSION);
    setState((prev) => ({
      ...prev,
      phase: 'racing',
      questions,
      currentQuestionIndex: 0,
      firstAttemptResults: [],
      playerPosition: 0,
      opponent1Position: 0,
      opponent2Position: 0,
      placement: null,
      stickersEarned: 0,
      timeRemaining: QUESTION_TIME_LIMIT_SECONDS,
    }));
    setHasIncorrectAttempt(false);
  }, []);

  const submitAnswer = useCallback(
    (optionId: string): { correct: boolean; firstAttempt: boolean } => {
      const currentQuestion = state.questions[state.currentQuestionIndex];
      if (!currentQuestion) {
        return { correct: false, firstAttempt: false };
      }

      const isCorrect = optionId === currentQuestion.correctOptionId;
      const isFirstAttempt = !hasIncorrectAttempt;

      // Opponents also "answer" whenever the player answers
      moveOpponents();

      if (!isCorrect) {
        // Wrong answer — record as incorrect and skip to next question (no movement)
        setHasIncorrectAttempt(true);

        const newFirstAttemptResults = [...state.firstAttemptResults, false];
        const isFinalQuestion = state.currentQuestionIndex === QUESTIONS_PER_SESSION - 1;

        if (isFinalQuestion) {
          finalizeRace(newFirstAttemptResults, state.playerPosition);
        } else {
          setState((prev) => ({
            ...prev,
            firstAttemptResults: newFirstAttemptResults,
            currentQuestionIndex: prev.currentQuestionIndex + 1,
            timeRemaining: QUESTION_TIME_LIMIT_SECONDS,
          }));
          setHasIncorrectAttempt(false);
        }

        return { correct: false, firstAttempt: false };
      }

      // Correct answer — update state
      const newFirstAttemptResults = [...state.firstAttemptResults, isFirstAttempt];
      const increment = getPlayerIncrement(QUESTIONS_PER_SESSION);
      const newPlayerPosition = Math.min(100, state.playerPosition + increment);

      const isFinalQuestion =
        state.currentQuestionIndex === QUESTIONS_PER_SESSION - 1;

      if (isFinalQuestion) {
        finalizeRace(newFirstAttemptResults, newPlayerPosition);
      } else {
        setState((prev) => ({
          ...prev,
          firstAttemptResults: newFirstAttemptResults,
          playerPosition: newPlayerPosition,
          timeRemaining: QUESTION_TIME_LIMIT_SECONDS,
        }));
      }

      // Reset incorrect attempt tracker for next question
      setHasIncorrectAttempt(false);

      return { correct: true, firstAttempt: isFirstAttempt };
    },
    [state.questions, state.currentQuestionIndex, state.firstAttemptResults, state.playerPosition, hasIncorrectAttempt, finalizeRace, moveOpponents]
  );

  const advanceToNextQuestion = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1,
      timeRemaining: QUESTION_TIME_LIMIT_SECONDS,
    }));
  }, []);

  const reset = useCallback(() => {
    clearAllTimers();
    setState(initialState);
    setHasIncorrectAttempt(false);
  }, [clearAllTimers]);

  const accuracyPercent = useMemo(() => {
    const answered = state.firstAttemptResults.length;
    if (answered === 0) return 0;
    const correctCount = state.firstAttemptResults.filter(Boolean).length;
    return (correctCount / answered) * 100;
  }, [state.firstAttemptResults]);

  const isFirstAttempt = !hasIncorrectAttempt;

  return {
    state,
    selectCharacter,
    startRace,
    submitAnswer,
    advanceToNextQuestion,
    skipQuestion,
    reset,
    accuracyPercent,
    isFirstAttempt,
  };
}
