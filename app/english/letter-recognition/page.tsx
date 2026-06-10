'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

import { ActivityShell } from '@/components/activity/ActivityShell';
import { QuestionDisplay } from '@/components/activity/QuestionDisplay';
import { CompletionScreen } from '@/components/activity/CompletionScreen';
import { CelebrationOverlay } from '@/components/activity/CelebrationOverlay';
import { AnswerOption, type AnswerOptionState } from '@/components/ui/AnswerOption';
import { useActivitySession } from '@/hooks/useActivitySession';
import { useSpeech } from '@/hooks/useSpeech';
import { useCelebration } from '@/hooks/useCelebration';
import { useAudio } from '@/hooks/useAudio';
import { generateLetterRecognitionQuestions } from '@/features/english/letter-recognition';

/**
 * Letter Recognition activity page.
 *
 * Children see a target uppercase letter displayed prominently and must select
 * the matching letter from four options. Speech synthesis pronounces the target
 * letter, celebrations trigger on correct answers, and encouragement plays on
 * incorrect ones.
 */
export default function LetterRecognitionPage() {
  const {
    currentQuestion,
    questionIndex,
    totalQuestions,
    isComplete,
    handleAnswer,
  } = useActivitySession('letter-recognition', generateLetterRecognitionQuestions);

  const { speak, isSupported: speechSupported } = useSpeech();
  const { celebrate, isActive: celebrationActive, message: celebrationMessage } = useCelebration();
  const { playEncouragement } = useAudio();

  // Track answer states for visual feedback on options
  const [optionStates, setOptionStates] = useState<Record<string, AnswerOptionState>>({});

  // Track the question index to detect question changes for speech
  const prevQuestionIndexRef = useRef<number>(-1);

  // Speak the target letter when a new question appears
  useEffect(() => {
    if (
      currentQuestion &&
      questionIndex !== prevQuestionIndexRef.current
    ) {
      prevQuestionIndexRef.current = questionIndex;
      // Reset option states for new question
      setOptionStates({});
      // Speak the target letter (e.g., "A")
      if (speechSupported) {
        speak(currentQuestion.speechText);
      }
    }
  }, [currentQuestion, questionIndex, speak, speechSupported]);

  // Handle answer selection with celebration/encouragement effects
  const onSelectAnswer = useCallback(
    (optionId: string) => {
      if (!currentQuestion) return;

      const isCorrect = optionId === currentQuestion.correctOptionId;

      if (isCorrect) {
        setOptionStates((prev) => ({ ...prev, [optionId]: 'correct' }));
        celebrate();
        // Small delay before advancing so the child sees the correct state
        setTimeout(() => {
          handleAnswer(optionId);
        }, 800);
      } else {
        setOptionStates((prev) => ({ ...prev, [optionId]: 'incorrect' }));
        playEncouragement();
        handleAnswer(optionId);
      }
    },
    [currentQuestion, celebrate, handleAnswer, playEncouragement],
  );

  // Show completion screen when all questions are done
  if (isComplete) {
    return (
      <CompletionScreen
        homeHref="/english"
        nextActivityHref="/english/beginning-sounds"
        nextActivityLabel="Beginning Sounds"
      />
    );
  }

  // Extract the target letter from the correct option value
  const targetLetter = currentQuestion
    ? String(
        currentQuestion.options.find(
          (opt) => opt.id === currentQuestion.correctOptionId,
        )?.value ?? 'A',
      )
    : 'A';

  return (
    <ActivityShell
      backHref="/english"
      questionIndex={questionIndex}
      totalQuestions={totalQuestions}
      title="Letter Recognition"
    >
      <div className="flex flex-col items-center gap-8 w-full max-w-2xl">
        {/* Question prompt and target letter displayed prominently */}
        <QuestionDisplay prompt={currentQuestion?.prompt ?? ''}>
          <div
            className="flex items-center justify-center p-6"
            aria-label={`The letter ${targetLetter}`}
          >
            <span className="text-[96px] md:text-[128px] font-bold text-primary leading-none">
              {targetLetter}
            </span>
          </div>
        </QuestionDisplay>

        {/* Answer options grid — each option is a letter */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          {currentQuestion?.options.map((option) => (
            <AnswerOption
              key={option.id}
              id={option.id}
              label={option.label}
              onSelect={onSelectAnswer}
              state={optionStates[option.id] ?? 'idle'}
              disabled={optionStates[currentQuestion.correctOptionId] === 'correct'}
            />
          ))}
        </div>
      </div>

      {/* Celebration overlay */}
      <CelebrationOverlay isActive={celebrationActive} message={celebrationMessage} />
    </ActivityShell>
  );
}
