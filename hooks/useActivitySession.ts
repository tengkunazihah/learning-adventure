'use client';

import { useCallback, useMemo, useState } from 'react';

import { QUESTIONS_PER_SESSION } from '@/lib/constants';
import { shuffle } from '@/lib/random';
import type { ActivityType, Question } from '@/types/activity';

type AnswerResult = 'correct' | 'incorrect' | null;

interface UseActivitySessionReturn {
  currentQuestion: Question | null;
  questionIndex: number;
  totalQuestions: number;
  isComplete: boolean;
  correctCount: number;
  handleAnswer: (optionId: string) => void;
  reset: () => void;
  lastAnswerResult: AnswerResult;
}

/**
 * Manages question flow, current index, answer handling, and completion state
 * for all activity types.
 *
 * - Generates and shuffles questions on mount (takes first QUESTIONS_PER_SESSION)
 * - Correct answers advance to next question; incorrect answers allow retry
 * - Score never decreases (Req 9.5)
 * - Session discarded if child navigates away before completion (Req 15.6)
 *
 * Integration note (Task 16.2):
 * Activity pages should call `recordActivityCompletion(activityType, correctCount, totalQuestions)`
 * from the useProgress() hook when `isComplete` becomes true. This wiring is handled
 * at the page/component level (see Task 19 integration) since the ProgressProvider
 * needs to be wrapped around the app in layout.tsx (Task 18).
 */
export function useActivitySession(
  _activityType: ActivityType,
  questionGenerator: () => Question[]
): UseActivitySessionReturn {
  const [questions, setQuestions] = useState<Question[]>(() =>
    shuffle(questionGenerator()).slice(0, QUESTIONS_PER_SESSION)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [lastAnswerResult, setLastAnswerResult] = useState<AnswerResult>(null);

  const totalQuestions = QUESTIONS_PER_SESSION;

  const isComplete = currentIndex >= totalQuestions;

  const currentQuestion = useMemo(
    () => (isComplete ? null : questions[currentIndex] ?? null),
    [isComplete, questions, currentIndex]
  );

  const handleAnswer = useCallback(
    (optionId: string) => {
      if (isComplete || !currentQuestion) return;

      if (optionId === currentQuestion.correctOptionId) {
        setCorrectCount((prev) => prev + 1);
        setCurrentIndex((prev) => prev + 1);
        setLastAnswerResult('correct');
      } else {
        // No penalty, no advancement — child can retry (Req 9.5, Req 2.5)
        setLastAnswerResult('incorrect');
      }
    },
    [isComplete, currentQuestion]
  );

  const reset = useCallback(() => {
    setQuestions(shuffle(questionGenerator()).slice(0, QUESTIONS_PER_SESSION));
    setCurrentIndex(0);
    setCorrectCount(0);
    setLastAnswerResult(null);
  }, [questionGenerator]);

  return {
    currentQuestion,
    questionIndex: currentIndex,
    totalQuestions,
    isComplete,
    correctCount,
    handleAnswer,
    reset,
    lastAnswerResult,
  };
}
