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
import { useSticker } from '@/hooks/useSticker';
import { generateCountAnimalsQuestions } from '@/features/math/count-animals';

/** Map animal names to their emoji representations */
const ANIMAL_EMOJI_MAP: Record<string, string> = {
  cat: '🐱',
  dog: '🐶',
  rabbit: '🐰',
  elephant: '🐘',
  giraffe: '🦒',
  penguin: '🐧',
  lion: '🦁',
  bear: '🐻',
};

/**
 * Extracts the animal name from the question prompt.
 * The prompt format is: "Count the {animal}s! How many do you see?"
 */
function extractAnimalFromPrompt(prompt: string): string {
  const match = prompt.match(/Count the (\w+)s!/i);
  return match ? match[1].toLowerCase() : 'cat';
}

/**
 * Gets the emoji for an animal name, falling back to a generic animal emoji.
 */
function getAnimalEmoji(animalName: string): string {
  return ANIMAL_EMOJI_MAP[animalName] ?? '🐾';
}

/**
 * Count the Animals activity page.
 *
 * Children see a group of animal emojis and must select the correct count
 * from four answer options. Speech synthesis reads the question aloud,
 * celebrations trigger on correct answers, and encouragement plays on incorrect ones.
 */
export default function CountAnimalsPage() {
  const {
    currentQuestion,
    questionIndex,
    totalQuestions,
    isComplete,
    handleAnswer,
  } = useActivitySession('count-animals', generateCountAnimalsQuestions);

  const { speak, isSupported: speechSupported } = useSpeech();
  const { celebrate, isActive: celebrationActive, message: celebrationMessage } = useCelebration();
  const { playEncouragement } = useAudio();
  const { sticker, awardNewSticker } = useSticker();

  // Track answer states for visual feedback on options
  const [optionStates, setOptionStates] = useState<Record<string, AnswerOptionState>>({});

  // Track the question index to detect question changes for speech
  const prevQuestionIndexRef = useRef<number>(-1);

  // Speak the question when it changes
  useEffect(() => {
    if (
      currentQuestion &&
      questionIndex !== prevQuestionIndexRef.current
    ) {
      prevQuestionIndexRef.current = questionIndex;
      // Reset option states for new question
      setOptionStates({});
      // Speak the question text
      if (speechSupported) {
        speak(currentQuestion.speechText);
      }
    }
  }, [currentQuestion, questionIndex, speak, speechSupported]);

  // Award a sticker when the session is complete
  useEffect(() => {
    if (isComplete) {
      awardNewSticker();
    }
  }, [isComplete, awardNewSticker]);

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
        sticker={sticker}
        homeHref="/math"
        nextActivityHref="/math/number-matching"
        nextActivityLabel="Number Matching"
      />
    );
  }

  // Derive the animal illustration from the current question
  const animalName = currentQuestion
    ? extractAnimalFromPrompt(currentQuestion.prompt)
    : 'cat';
  const emoji = getAnimalEmoji(animalName);
  const correctCount = currentQuestion
    ? Number(
        currentQuestion.options.find(
          (opt) => opt.id === currentQuestion.correctOptionId,
        )?.value ?? 1,
      )
    : 1;

  return (
    <ActivityShell
      backHref="/math"
      questionIndex={questionIndex}
      totalQuestions={totalQuestions}
      title="Count the Animals"
    >
      <div className="flex flex-col items-center gap-8 w-full max-w-2xl">
        {/* Question display with animal emoji illustration */}
        <QuestionDisplay prompt={currentQuestion?.prompt ?? ''}>
          <div
            className="text-kid-large flex flex-wrap items-center justify-center gap-3 p-4"
            aria-label={`${correctCount} ${animalName}s`}
          >
            {Array.from({ length: correctCount }).map((_, i) => (
              <span key={i} className="text-5xl md:text-6xl" aria-hidden="true">
                {emoji}
              </span>
            ))}
          </div>
        </QuestionDisplay>

        {/* Answer options grid */}
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
