'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

import { ActivityShell } from '@/components/activity/ActivityShell';
import { VisualMathDisplay } from '@/components/activity/VisualMathDisplay';
import { CompletionScreen } from '@/components/activity/CompletionScreen';
import { CelebrationOverlay } from '@/components/activity/CelebrationOverlay';
import { AnswerOption, type AnswerOptionState } from '@/components/ui/AnswerOption';
import { useActivitySession } from '@/hooks/useActivitySession';
import { useSpeech } from '@/hooks/useSpeech';
import { useCelebration } from '@/hooks/useCelebration';
import { useAudio } from '@/hooks/useAudio';
import { useSticker } from '@/hooks/useSticker';
import { useProgress } from '@/hooks/useProgress';
import {
  parseMathQuestionId,
  generateVisualMathQuestions,
} from '@/features/math/visual-math-problems';
import { MATH_OBJECT_EMOJI_MAP, QUESTIONS_PER_SESSION } from '@/lib/constants';

/**
 * Visual Math Problems activity page.
 *
 * Children see a visual representation of addition or subtraction problems
 * (groups of object emojis) and must select the correct numerical answer
 * from four options. Speech synthesis reads the question aloud,
 * celebrations trigger on correct answers, and encouragement plays on incorrect ones.
 */
export default function VisualMathProblemsPage() {
  const {
    currentQuestion,
    questionIndex,
    totalQuestions,
    isComplete,
    correctCount,
    handleAnswer,
  } = useActivitySession('visual-math-problems', generateVisualMathQuestions);

  const { speak, stop: stopSpeech, isSupported: isSpeechSupported } = useSpeech({
    rate: 0.8,
    pitch: 1.1,
  });
  const { celebrate, isActive: celebrationActive, message: celebrationMessage } = useCelebration();
  const { playEncouragement } = useAudio();
  const { sticker, awardNewSticker } = useSticker();
  const { recordActivityCompletion } = useProgress();

  // Track answer states for visual feedback on options
  const [optionStates, setOptionStates] = useState<Record<string, AnswerOptionState>>({});
  // Track whether options should be disabled (during celebration)
  const [allDisabled, setAllDisabled] = useState(false);

  // Track the question index to detect question changes for speech
  const prevQuestionIndexRef = useRef<number>(-1);

  // Parse the current question ID to extract display parameters
  const parsed = useMemo(() => {
    if (!currentQuestion) return null;
    return parseMathQuestionId(currentQuestion.id);
  }, [currentQuestion]);

  // Get the emoji for the current question's object type
  const objectEmoji = parsed
    ? MATH_OBJECT_EMOJI_MAP[parsed.objectType] ?? '🍎'
    : '🍎';

  // Speak the question when it changes
  useEffect(() => {
    if (
      currentQuestion &&
      questionIndex !== prevQuestionIndexRef.current
    ) {
      prevQuestionIndexRef.current = questionIndex;
      // Reset option states for new question
      setOptionStates({});
      setAllDisabled(false);
      // Cancel any in-progress speech then speak the question text
      if (isSpeechSupported) {
        stopSpeech();
        speak(currentQuestion.speechText);
      }
    }
  }, [currentQuestion, questionIndex, speak, stopSpeech, isSpeechSupported]);

  // Award a sticker and record completion when the session is complete
  useEffect(() => {
    if (isComplete) {
      awardNewSticker();
      recordActivityCompletion('visual-math-problems', correctCount, totalQuestions);
    }
  }, [isComplete, awardNewSticker, recordActivityCompletion, correctCount, totalQuestions]);

  // Handle repeat button click
  const handleRepeat = useCallback(() => {
    if (currentQuestion && isSpeechSupported) {
      stopSpeech();
      speak(currentQuestion.speechText);
    }
  }, [currentQuestion, isSpeechSupported, stopSpeech, speak]);

  // Handle answer selection with celebration/encouragement effects
  const onSelectAnswer = useCallback(
    (optionId: string) => {
      if (!currentQuestion || allDisabled) return;

      const isCorrect = optionId === currentQuestion.correctOptionId;

      if (isCorrect) {
        setOptionStates((prev) => ({ ...prev, [optionId]: 'correct' }));
        setAllDisabled(true);
        celebrate();
        // Auto-advance after celebration duration (2500ms)
        setTimeout(() => {
          handleAnswer(optionId);
        }, 2500);
      } else {
        setOptionStates((prev) => ({ ...prev, [optionId]: 'incorrect' }));
        playEncouragement();
        // Allow retry — don't advance, just mark the option
        // handleAnswer is called to track the incorrect attempt (no penalty)
        handleAnswer(optionId);
      }
    },
    [currentQuestion, allDisabled, celebrate, handleAnswer, playEncouragement],
  );

  // Show completion screen when all questions are done
  if (isComplete) {
    return (
      <CompletionScreen
        sticker={sticker}
        homeHref="/math"
      />
    );
  }

  return (
    <ActivityShell
      backHref="/math"
      questionIndex={questionIndex}
      totalQuestions={totalQuestions}
      title="Visual Math"
    >
      <div className="flex flex-col items-center gap-8 w-full max-w-2xl">
        {/* Aria-live region for screen reader announcements */}
        <div aria-live="polite" className="sr-only">
          {currentQuestion
            ? `Question ${questionIndex + 1} of ${QUESTIONS_PER_SESSION}: ${currentQuestion.speechText}`
            : ''}
        </div>

        {/* Visual math problem display */}
        {parsed && (
          <VisualMathDisplay
            operator={parsed.operator}
            operand1={parsed.operand1}
            operand2={parsed.operand2}
            objectEmoji={objectEmoji}
          />
        )}

        {/* Question prompt text */}
        <p
          className="text-kid-heading font-bold text-neutral-800 text-center"
          aria-label={currentQuestion?.speechText}
        >
          {currentQuestion?.prompt}
        </p>

        {/* Repeat button — hidden if speech not supported */}
        {isSpeechSupported && (
          <button
            type="button"
            onClick={handleRepeat}
            className="min-w-touch min-h-touch px-4 py-2 rounded-2xl bg-secondary/20 hover:bg-secondary/30 text-kid-body font-bold text-neutral-700 transition-colors"
            aria-label="Repeat question"
          >
            🔊 Repeat
          </button>
        )}

        {/* Answer options grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          {currentQuestion?.options.map((option) => (
            <AnswerOption
              key={option.id}
              id={option.id}
              label={option.label}
              onSelect={onSelectAnswer}
              state={optionStates[option.id] ?? 'idle'}
              disabled={allDisabled || optionStates[option.id] === 'incorrect'}
            />
          ))}
        </div>
      </div>

      {/* Celebration overlay */}
      <CelebrationOverlay isActive={celebrationActive} message={celebrationMessage} />
    </ActivityShell>
  );
}
