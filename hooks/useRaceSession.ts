'use client';

import { useCallback, useMemo, useState } from 'react';

import { QUESTIONS_PER_SESSION } from '@/lib/constants';
import type { RaceCharacter, RaceQuestion, Placement } from '@/features/math/math-race';
import {
  generateRaceQuestions,
  calculatePlacement,
  calculateStickerReward,
  getPlayerIncrement,
  calculateOpponentPositions,
} from '@/features/math/math-race';

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
}

export interface UseRaceSessionReturn {
  state: RaceState;
  selectCharacter: (character: RaceCharacter) => void;
  startRace: () => void;
  submitAnswer: (optionId: string) => { correct: boolean; firstAttempt: boolean };
  advanceToNextQuestion: () => void;
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
};

/**
 * Manages the race session state including character selection, question flow,
 * answer tracking, player/opponent positions, and placement calculation.
 *
 * - Tracks first-attempt accuracy per question (Req 4.3, 5.1, 5.7)
 * - Advances player position on correct answer (Req 3.1)
 * - Does not move player on incorrect answer (Req 3.3)
 * - Calculates placement and stickers on final question (Req 5.2-5.6, 6.1-6.3)
 * - Discards session on unmount during racing phase (Req 9.4)
 */
export function useRaceSession(): UseRaceSessionReturn {
  const [state, setState] = useState<RaceState>(initialState);
  // Track whether any incorrect answer has been given for the current question
  const [hasIncorrectAttempt, setHasIncorrectAttempt] = useState(false);

  const selectCharacter = useCallback((character: RaceCharacter) => {
    setState((prev) => ({
      ...prev,
      selectedCharacter: character,
    }));
  }, []);

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

      if (!isCorrect) {
        // Mark that an incorrect attempt has been made for this question
        setHasIncorrectAttempt(true);
        return { correct: false, firstAttempt: false };
      }

      // Correct answer — update state
      const newFirstAttemptResults = [...state.firstAttemptResults, isFirstAttempt];
      const increment = getPlayerIncrement(QUESTIONS_PER_SESSION);
      const newPlayerPosition = Math.min(100, state.playerPosition + increment);

      const isFinalQuestion =
        state.currentQuestionIndex === QUESTIONS_PER_SESSION - 1;

      if (isFinalQuestion) {
        // Calculate final results
        const correctFirstAttempts = newFirstAttemptResults.filter(Boolean).length;
        const accuracy = (correctFirstAttempts / QUESTIONS_PER_SESSION) * 100;
        const placement = calculatePlacement(accuracy);
        const stickersEarned = calculateStickerReward(placement);
        const { opponent1, opponent2 } = calculateOpponentPositions(
          accuracy,
          QUESTIONS_PER_SESSION
        );

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
      } else {
        setState((prev) => ({
          ...prev,
          firstAttemptResults: newFirstAttemptResults,
          playerPosition: newPlayerPosition,
        }));
      }

      // Reset incorrect attempt tracker for next question
      setHasIncorrectAttempt(false);

      return { correct: true, firstAttempt: isFirstAttempt };
    },
    [state.questions, state.currentQuestionIndex, state.firstAttemptResults, state.playerPosition, hasIncorrectAttempt]
  );

  const advanceToNextQuestion = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1,
    }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
    setHasIncorrectAttempt(false);
  }, []);

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
    reset,
    accuracyPercent,
    isFirstAttempt,
  };
}
