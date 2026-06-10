'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

import { ActivityShell } from '@/components/activity/ActivityShell';
import { QuestionDisplay } from '@/components/activity/QuestionDisplay';
import { CompletionScreen } from '@/components/activity/CompletionScreen';
import { CelebrationOverlay } from '@/components/activity/CelebrationOverlay';
import { TouchButton } from '@/components/ui/TouchButton';
import { useActivitySession } from '@/hooks/useActivitySession';
import { useSpeech } from '@/hooks/useSpeech';
import { useCelebration } from '@/hooks/useCelebration';
import { useAudio } from '@/hooks/useAudio';
import { generateShapeHuntQuestions } from '@/features/math/shape-hunt';

/** Colors used for shape SVG fills — bright, kid-friendly palette */
const SHAPE_COLORS = [
  '#FF6B6B', // Coral red
  '#4ECDC4', // Teal
  '#FFE66D', // Bright yellow
  '#7BC950', // Green
  '#FF6B35', // Orange
  '#9B59B6', // Purple
  '#3498DB', // Blue
  '#E74C3C', // Red
  '#1ABC9C', // Emerald
  '#F39C12', // Amber
];

/**
 * Picks a random color from the palette for each shape option.
 * Uses a simple seeded approach based on index + question to vary per round.
 */
function getShapeColor(index: number, questionIndex: number): string {
  const colorIndex = (index + questionIndex * 3) % SHAPE_COLORS.length;
  return SHAPE_COLORS[colorIndex];
}

/** Props for the ShapeSvg helper component */
interface ShapeSvgProps {
  /** Shape name: Circle, Square, Triangle, Rectangle, or Star */
  shape: string;
  /** SVG fill color */
  fill: string;
  /** Size of the SVG viewBox (rendered square) */
  size?: number;
}

/**
 * Renders an SVG shape based on the shape name.
 * Supports: Circle, Square, Triangle, Rectangle, Star.
 */
function ShapeSvg({ shape, fill, size = 80 }: ShapeSvgProps) {
  const renderShape = () => {
    switch (shape) {
      case 'Circle':
        return <circle cx="50" cy="50" r="40" fill={fill} />;
      case 'Square':
        return <rect x="15" y="15" width="70" height="70" fill={fill} />;
      case 'Triangle':
        return <polygon points="50,10 90,90 10,90" fill={fill} />;
      case 'Rectangle':
        return <rect x="10" y="25" width="80" height="50" fill={fill} rx="2" />;
      case 'Star':
        return (
          <polygon
            points="50,5 61,35 95,35 68,57 79,90 50,70 21,90 32,57 5,35 39,35"
            fill={fill}
          />
        );
      default:
        return <circle cx="50" cy="50" r="40" fill={fill} />;
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      className="pointer-events-none"
    >
      {renderShape()}
    </svg>
  );
}

/**
 * Shape Hunt activity page.
 *
 * Children hear "Tap the [shape]" and must identify the correct shape
 * from a set of 4-6 SVG shapes displayed as colorful, tappable options.
 * Celebrations trigger on correct answers, and encouragement plays on incorrect ones.
 */
export default function ShapeHuntPage() {
  const {
    currentQuestion,
    questionIndex,
    totalQuestions,
    isComplete,
    handleAnswer,
  } = useActivitySession('shape-hunt', generateShapeHuntQuestions);

  const { speak, isSupported: speechSupported } = useSpeech();
  const { celebrate, isActive: celebrationActive, message: celebrationMessage } = useCelebration();
  const { playEncouragement } = useAudio();

  // Track answer states for visual feedback on options
  const [optionStates, setOptionStates] = useState<Record<string, 'idle' | 'correct' | 'incorrect'>>({});

  // Track the question index to detect question changes for speech
  const prevQuestionIndexRef = useRef<number>(-1);

  // Speak "Tap the [shape]" when a new question appears
  useEffect(() => {
    if (
      currentQuestion &&
      questionIndex !== prevQuestionIndexRef.current
    ) {
      prevQuestionIndexRef.current = questionIndex;
      // Reset option states for new question
      setOptionStates({});
      // Speak the instruction
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
  // Shape Hunt is the last math activity — no next activity
  if (isComplete) {
    return (
      <CompletionScreen
        homeHref="/math"
      />
    );
  }

  return (
    <ActivityShell
      backHref="/math"
      questionIndex={questionIndex}
      totalQuestions={totalQuestions}
      title="Shape Hunt"
    >
      <div className="flex flex-col items-center gap-8 w-full max-w-2xl">
        {/* Question prompt */}
        <QuestionDisplay prompt={currentQuestion?.prompt ?? ''} />

        {/* Shape options grid — SVG shapes rendered inside TouchButtons */}
        <div className="grid grid-cols-3 md:grid-cols-3 gap-4 w-full justify-items-center">
          {currentQuestion?.options.map((option, index) => {
            const state = optionStates[option.id] ?? 'idle';
            const isAnswered = optionStates[currentQuestion.correctOptionId] === 'correct';
            const fillColor = getShapeColor(index, questionIndex);

            // Determine border style based on state
            const borderStyle =
              state === 'correct'
                ? 'ring-4 ring-success bg-success/20'
                : state === 'incorrect'
                  ? 'ring-4 ring-amber-300 bg-amber-50'
                  : '';

            return (
              <TouchButton
                key={option.id}
                variant="default"
                className={`w-28 h-28 md:w-32 md:h-32 flex items-center justify-center ${borderStyle}`}
                disabled={isAnswered}
                aria-label={`${option.label} shape`}
                onClick={() => onSelectAnswer(option.id)}
              >
                <ShapeSvg
                  shape={option.value as string}
                  fill={fillColor}
                  size={64}
                />
              </TouchButton>
            );
          })}
        </div>
      </div>

      {/* Celebration overlay */}
      <CelebrationOverlay isActive={celebrationActive} message={celebrationMessage} />
    </ActivityShell>
  );
}
