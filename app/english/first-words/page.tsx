'use client';

import { useEffect, useRef, useCallback } from 'react';

import { ActivityShell } from '@/components/activity/ActivityShell';
import { CompletionScreen } from '@/components/activity/CompletionScreen';
import { TouchButton } from '@/components/ui/TouchButton';
import { useActivitySession } from '@/hooks/useActivitySession';
import { useSpeech } from '@/hooks/useSpeech';
import {
  generateFirstWordsQuestions,
  FIRST_WORDS_DATA,
  type WordData,
} from '@/features/english/first-words';

/**
 * First Words activity page.
 *
 * This is a word exploration activity (not a quiz). Children see a word
 * displayed with its emoji and hear it pronounced via speech synthesis.
 * Tapping the emoji or word repeats the pronunciation. A Next button
 * advances to the next word. After 5 words the session is complete.
 */
export default function FirstWordsPage() {
  const {
    currentQuestion,
    questionIndex,
    totalQuestions,
    isComplete,
    handleAnswer,
  } = useActivitySession('first-words', generateFirstWordsQuestions);

  const { speak, isSupported: speechSupported } = useSpeech();

  // Track the question index to detect question changes for auto-speech
  const prevQuestionIndexRef = useRef<number>(-1);

  // Find the WordData for the current question's word
  const currentWordData: WordData | undefined = currentQuestion
    ? FIRST_WORDS_DATA.find((w) => w.word === currentQuestion.prompt)
    : undefined;

  // Speak the word automatically when a new question appears (Req 7.2)
  useEffect(() => {
    if (
      currentQuestion &&
      questionIndex !== prevQuestionIndexRef.current
    ) {
      prevQuestionIndexRef.current = questionIndex;
      if (speechSupported) {
        speak(currentQuestion.speechText);
      }
    }
  }, [currentQuestion, questionIndex, speak, speechSupported]);

  // Tap on emoji/word repeats pronunciation (Req 7.4)
  const handleTapWord = useCallback(() => {
    if (currentQuestion && speechSupported) {
      speak(currentQuestion.speechText);
    }
  }, [currentQuestion, speak, speechSupported]);

  // Tap Next advances to the next word
  const handleNext = useCallback(() => {
    if (currentQuestion) {
      handleAnswer(currentQuestion.correctOptionId);
    }
  }, [currentQuestion, handleAnswer]);

  // Show completion screen when all words are viewed (Req 7.6)
  if (isComplete) {
    return (
      <CompletionScreen
        homeHref="/english"
      />
    );
  }

  return (
    <ActivityShell
      backHref="/english"
      questionIndex={questionIndex}
      totalQuestions={totalQuestions}
      title="First Words"
    >
      <div className="flex flex-col items-center gap-8 w-full max-w-md">
        {/* Word emoji with animation (Req 7.1, 7.3) — tappable for speech */}
        <button
          type="button"
          onClick={handleTapWord}
          className="focus:outline-none focus:ring-4 focus:ring-accent rounded-3xl p-4"
          aria-label={`Hear the word ${currentQuestion?.prompt ?? ''}`}
        >
          <span
            className={`text-[120px] md:text-[160px] leading-none block ${currentWordData?.animation ?? ''}`}
            role="img"
            aria-label={currentQuestion?.prompt ?? ''}
          >
            {currentWordData?.emoji ?? ''}
          </span>
        </button>

        {/* Word text — tappable for speech (Req 7.4) */}
        <button
          type="button"
          onClick={handleTapWord}
          className="focus:outline-none focus:ring-4 focus:ring-accent rounded-2xl px-6 py-2"
          aria-label={`Hear the word ${currentQuestion?.prompt ?? ''}`}
        >
          <span className="text-kid-large font-bold text-neutral-800">
            {currentQuestion?.prompt ?? ''}
          </span>
        </button>

        {/* Next button to advance (Req 7.5) */}
        <TouchButton
          variant="primary"
          onClick={handleNext}
          className="mt-4 px-12"
        >
          Next ➡️
        </TouchButton>
      </div>
    </ActivityShell>
  );
}
