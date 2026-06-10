'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import { CharacterSelector } from '@/components/activity/CharacterSelector';
import { RaceTrack } from '@/components/activity/RaceTrack';
import { RaceResults } from '@/components/activity/RaceResults';
import { CelebrationOverlay } from '@/components/activity/CelebrationOverlay';
import { BackButton } from '@/components/ui/BackButton';
import { AnswerOption, type AnswerOptionState } from '@/components/ui/AnswerOption';
import { useRaceSession } from '@/hooks/useRaceSession';
import { useProgress } from '@/hooks/useProgress';
import { useSpeech } from '@/hooks/useSpeech';
import { useCelebration } from '@/hooks/useCelebration';
import { useAudio } from '@/hooks/useAudio';
import { awardSticker } from '@/features/rewards/sticker-engine';
import { RACE_CHARACTERS, CELEBRATION_DURATION_MS, QUESTIONS_PER_SESSION, QUESTION_TIME_LIMIT_SECONDS } from '@/lib/constants';
import type { RaceCharacter } from '@/features/math/math-race';
import type { Sticker } from '@/types/sticker';

/** Delay between sequential sticker award animations (ms) */
const STICKER_ANIMATION_DELAY_MS = 1000;

/**
 * Attempts to persist a sticker with retry logic.
 * Retries up to 2 additional times on failure (3 total attempts).
 */
async function persistStickerWithRetry(
  addSticker: (sticker: Sticker) => void,
  sticker: Sticker
): Promise<void> {
  const MAX_ATTEMPTS = 3;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      addSticker(sticker);
      return; // Success
    } catch {
      if (attempt === MAX_ATTEMPTS) {
        // Final attempt failed — sticker animation still shows
        return;
      }
      // Exponential backoff before retry: 100ms, 200ms
      await new Promise((resolve) => setTimeout(resolve, attempt * 100));
    }
  }
}

/**
 * Math Race activity page.
 *
 * Orchestrates the full race flow:
 * 1. Character Selection — pick a racer, show back button
 * 2. Racing — answer questions with timer, animate track, opponents move randomly
 *    - Correct answer: celebrate, move forward, advance
 *    - Wrong answer: brief feedback, skip to next question, no movement
 * 3. Results — show podium, placement, stickers earned
 */
export default function MathRacePage() {
  const router = useRouter();

  // Core race state management
  const {
    state,
    selectCharacter,
    startRace,
    submitAnswer,
    advanceToNextQuestion,
    reset,
    accuracyPercent,
  } = useRaceSession();

  // Progress and sticker hooks
  const { progress, recordActivityCompletion, addSticker } = useProgress();

  // Speech, celebration, and audio hooks
  const { speak, stop: stopSpeech, isSupported: speechSupported } = useSpeech();
  const { celebrate, isActive: celebrationActive, message: celebrationMessage } = useCelebration();
  const { playCelebration, playEncouragement } = useAudio();

  // Track option visual states for current question
  const [optionStates, setOptionStates] = useState<Record<string, AnswerOptionState>>({});
  // Track whether we're in the celebration delay before auto-advance
  const [isCelebrating, setIsCelebrating] = useState(false);
  // Track whether showing wrong answer feedback before skipping
  const [isShowingWrongFeedback, setIsShowingWrongFeedback] = useState(false);

  // Sticker awarding state
  const [isAwardingStickers, setIsAwardingStickers] = useState(false);
  const [awardedStickers, setAwardedStickers] = useState<Sticker[]>([]);
  const [currentStickerIndex, setCurrentStickerIndex] = useState(0);
  const [awardingComplete, setAwardingComplete] = useState(false);
  // Guard to prevent awarding stickers multiple times (e.g. StrictMode)
  const hasAwardedRef = useRef(false);
  // Keep a ref to the latest collected stickers for the award function
  const collectedRef = useRef(progress.stickersCollected);
  collectedRef.current = progress.stickersCollected;

  // Detect prefers-reduced-motion
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // Award stickers and record completion when race finishes (phase === 'results')
  useEffect(() => {
    if (state.phase !== 'results' || hasAwardedRef.current) return;
    hasAwardedRef.current = true;

    const stickersToAward = state.stickersEarned;
    const correctCount = state.firstAttemptResults.filter(Boolean).length;

    // If no stickers to award, just record completion and proceed
    if (stickersToAward === 0) {
      recordActivityCompletion('math-race', correctCount, QUESTIONS_PER_SESSION);
      setAwardingComplete(true);
      return;
    }

    // Start awarding stickers sequentially
    setIsAwardingStickers(true);

    const awardSequence = async () => {
      const stickers: Sticker[] = [];
      // Use a local copy of collected stickers to avoid awarding duplicates within the same session
      let localCollected = [...collectedRef.current];

      for (let i = 0; i < stickersToAward; i++) {
        // Award a new sticker
        const newSticker = awardSticker(localCollected);
        stickers.push(newSticker);
        localCollected = [...localCollected, newSticker];

        // Persist with retry (up to 2 retries)
        await persistStickerWithRetry(addSticker, newSticker);

        // Update displayed stickers sequentially
        setAwardedStickers([...stickers]);
        setCurrentStickerIndex(i);

        // Wait for animation delay between stickers
        if (i < stickersToAward - 1) {
          await new Promise((resolve) => setTimeout(resolve, STICKER_ANIMATION_DELAY_MS));
        }
      }

      // All stickers awarded and persisted — record activity completion
      recordActivityCompletion('math-race', correctCount, QUESTIONS_PER_SESSION);

      // Brief delay after last sticker before showing results
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsAwardingStickers(false);
      setAwardingComplete(true);
    };

    awardSequence();
  }, [state.phase, state.stickersEarned, state.firstAttemptResults, addSticker, recordActivityCompletion]);

  // Track current question index for speech triggering
  const prevQuestionIndexRef = useRef<number>(-1);

  // Speak the question when it changes during racing phase
  useEffect(() => {
    if (
      state.phase === 'racing' &&
      state.currentQuestionIndex !== prevQuestionIndexRef.current
    ) {
      prevQuestionIndexRef.current = state.currentQuestionIndex;

      // Reset option states for new question
      setOptionStates({});
      setIsCelebrating(false);
      setIsShowingWrongFeedback(false);

      // Cancel previous speech and speak new question
      const currentQuestion = state.questions[state.currentQuestionIndex];
      if (currentQuestion && speechSupported) {
        try {
          stopSpeech();
          speak(currentQuestion.speechText);
        } catch {
          // Speech failure handled gracefully — visual feedback still displays
        }
      }
    }
  }, [state.phase, state.currentQuestionIndex, state.questions, speak, stopSpeech, speechSupported]);

  // Determine opponent characters (the two not selected by the player)
  const opponents = useMemo((): [RaceCharacter, RaceCharacter] => {
    const others = RACE_CHARACTERS
      .map((c) => c.id as RaceCharacter)
      .filter((id) => id !== state.selectedCharacter);
    return [others[0], others[1]];
  }, [state.selectedCharacter]);

  // Build allCharacters array ordered by placement for results
  const allCharactersForResults = useMemo((): RaceCharacter[] => {
    if (!state.selectedCharacter || state.placement === null) {
      return ['duck', 'panda', 'rabbit'];
    }

    const player = state.selectedCharacter;
    const [opp1, opp2] = opponents;
    const placement = state.placement;

    // Create array of 3 characters ordered by placement (index 0 = 1st, 1 = 2nd, 2 = 3rd)
    const result: RaceCharacter[] = ['duck', 'duck', 'duck']; // placeholder

    // Player goes at their placement index (0-based)
    result[placement - 1] = player;

    // Fill opponents in remaining spots
    const remainingSlots = [0, 1, 2].filter((i) => i !== placement - 1);
    result[remainingSlots[0]] = opp1;
    result[remainingSlots[1]] = opp2;

    return result;
  }, [state.selectedCharacter, state.placement, opponents]);

  // Handle answer selection
  const onSelectAnswer = useCallback(
    (optionId: string) => {
      if (isCelebrating || isShowingWrongFeedback) return;

      const { correct } = submitAnswer(optionId);

      if (correct) {
        // Mark as correct
        setOptionStates((prev) => ({ ...prev, [optionId]: 'correct' }));
        setIsCelebrating(true);

        // Play celebration sound and show overlay
        try {
          playCelebration();
        } catch {
          // Audio failure — visual feedback still displays
        }
        celebrate();

        // Auto-advance after celebration duration
        setTimeout(() => {
          advanceToNextQuestion();
        }, CELEBRATION_DURATION_MS);
      } else {
        // Mark as incorrect — show brief feedback then skip
        setOptionStates((prev) => ({ ...prev, [optionId]: 'incorrect' }));
        setIsShowingWrongFeedback(true);

        // Play encouragement sound
        try {
          playEncouragement();
        } catch {
          // Audio failure — visual feedback still displays
        }

        // The hook already advanced to next question, but we show feedback briefly
        // The question index change will trigger the reset via the useEffect above
      }
    },
    [isCelebrating, isShowingWrongFeedback, submitAnswer, celebrate, playCelebration, playEncouragement, advanceToNextQuestion]
  );

  // Handle "Start Race" — transition from character select to racing
  const handleStartRace = useCallback(() => {
    startRace();
  }, [startRace]);

  // Handle "Race Again" from results
  const handleRaceAgain = useCallback(() => {
    prevQuestionIndexRef.current = -1;
    hasAwardedRef.current = false;
    setIsAwardingStickers(false);
    setAwardedStickers([]);
    setCurrentStickerIndex(0);
    setAwardingComplete(false);
    reset();
  }, [reset]);

  // Handle "Back to Math" from results
  const handleBackToMath = useCallback(() => {
    router.push('/math');
  }, [router]);

  // Current question for the racing phase
  const currentQuestion = state.phase === 'racing'
    ? state.questions[state.currentQuestionIndex]
    : null;

  // Timer color based on remaining time
  const timerColor = state.timeRemaining <= 3
    ? 'text-red-500'
    : state.timeRemaining <= 5
      ? 'text-orange-500'
      : 'text-neutral-700';

  // Timer progress percentage
  const timerPercent = (state.timeRemaining / QUESTION_TIME_LIMIT_SECONDS) * 100;

  // --- RENDER ---

  // Sticker awarding phase (between racing end and results display)
  if (state.phase === 'results' && isAwardingStickers && !awardingComplete) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8 gap-6">
        <h2 className="text-kid-heading font-bold text-primary" aria-live="polite">
          🎉 Earning Stickers!
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {awardedStickers.map((sticker, index) => (
            <div
              key={sticker.id + index}
              className="flex flex-col items-center gap-2 animate-bounce"
              style={{
                animationDelay: `${index * 200}ms`,
                animationDuration: '800ms',
              }}
            >
              <span className="text-5xl" aria-label={sticker.name}>
                {sticker.imageUrl}
              </span>
              <span className="text-sm font-medium text-neutral-700">
                {sticker.name}
              </span>
            </div>
          ))}
        </div>
        <p className="text-kid-body text-neutral-600" aria-live="polite">
          Sticker {currentStickerIndex + 1} of {state.stickersEarned}
        </p>
      </div>
    );
  }

  // Results phase (shown after sticker awarding completes or if 0 stickers)
  if (state.phase === 'results' && awardingComplete && state.selectedCharacter && state.placement !== null) {
    return (
      <RaceResults
        playerCharacter={state.selectedCharacter}
        placement={state.placement}
        accuracyPercent={accuracyPercent}
        stickersEarned={state.stickersEarned}
        allCharacters={allCharactersForResults}
        onRaceAgain={handleRaceAgain}
        onBackToMath={handleBackToMath}
      />
    );
  }

  // Character selection phase
  if (state.phase === 'character-select') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="mb-4">
            <BackButton href="/math" label="Math" />
          </div>
          <CharacterSelector
            selectedCharacter={state.selectedCharacter}
            onSelect={selectCharacter}
            onStartRace={handleStartRace}
          />
        </div>
      </div>
    );
  }

  // Racing phase
  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 py-6 gap-6">
      {/* Header: Question indicator + Timer */}
      <div className="w-full max-w-xl flex items-center justify-between">
        <div className="text-kid-body font-bold text-neutral-700" aria-live="polite">
          Question {state.currentQuestionIndex + 1} of {state.questions.length}
        </div>

        {/* Timer display */}
        <div className="flex items-center gap-2" aria-label={`${state.timeRemaining} seconds remaining`}>
          <div className="relative w-32 h-3 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-linear"
              style={{
                width: `${timerPercent}%`,
                backgroundColor: state.timeRemaining <= 3 ? '#ef4444' : state.timeRemaining <= 5 ? '#f97316' : '#22c55e',
              }}
            />
          </div>
          <span className={`text-lg font-bold tabular-nums ${timerColor}`} aria-live="polite">
            {state.timeRemaining}s
          </span>
        </div>
      </div>

      {/* Race track */}
      {state.selectedCharacter && (
        <RaceTrack
          playerCharacter={state.selectedCharacter}
          playerPosition={state.playerPosition}
          opponent1Character={opponents[0]}
          opponent1Position={state.opponent1Position}
          opponent2Character={opponents[1]}
          opponent2Position={state.opponent2Position}
          reducedMotion={reducedMotion}
        />
      )}

      {/* Question text */}
      {currentQuestion && (
        <div className="text-center">
          <p className="text-kid-heading font-bold text-primary">
            {currentQuestion.speechText}
          </p>
        </div>
      )}

      {/* Answer options */}
      {currentQuestion && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-xl">
          {currentQuestion.options.map((option) => (
            <AnswerOption
              key={option.id}
              id={option.id}
              label={option.label}
              onSelect={onSelectAnswer}
              state={optionStates[option.id] ?? 'idle'}
              disabled={isCelebrating || isShowingWrongFeedback}
            />
          ))}
        </div>
      )}

      {/* Wrong answer feedback message */}
      {isShowingWrongFeedback && (
        <div className="text-center text-orange-600 font-bold text-kid-body animate-pulse" aria-live="assertive">
          Oops! Keep going! 💪
        </div>
      )}

      {/* Celebration overlay */}
      <CelebrationOverlay isActive={celebrationActive} message={celebrationMessage} />
    </div>
  );
}
