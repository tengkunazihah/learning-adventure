'use client';

import React, { useMemo } from 'react';
import { TouchButton } from '@/components/ui/TouchButton';
import { RACE_CHARACTERS } from '@/lib/constants';
import type { RaceCharacter, Placement } from '@/features/math/math-race';

export interface RaceResultsProps {
  playerCharacter: RaceCharacter;
  placement: Placement;
  accuracyPercent: number;
  stickersEarned: number;
  allCharacters: RaceCharacter[];
  onRaceAgain: () => void;
  onBackToMath: () => void;
}

const CONGRATULATORY_MESSAGES = [
  'Amazing! You\'re the champion! 🏆',
  'Incredible race! First place! 🥇',
  'You did it! Number one! 🎉',
];

const SUPPORTIVE_MESSAGES = [
  'Great effort! Try again to win! 💪',
  'You\'re getting better! Keep racing! 🌟',
  'Nice try! You\'ll get first next time! 🚀',
];

function getCharacterEmoji(character: RaceCharacter): string {
  const found = RACE_CHARACTERS.find((c) => c.id === character);
  return found?.emoji ?? '🏁';
}

function getCharacterLabel(character: RaceCharacter): string {
  const found = RACE_CHARACTERS.find((c) => c.id === character);
  return found?.label ?? character;
}

function getPlacementLabel(placement: Placement): string {
  switch (placement) {
    case 1:
      return '1st Place!';
    case 2:
      return '2nd Place!';
    case 3:
      return '3rd Place!';
  }
}

/**
 * Displays final race results with a podium, stats, and navigation.
 * Shows placement, accuracy percentage, stickers earned, and an
 * encouraging message based on placement.
 */
export function RaceResults({
  playerCharacter,
  placement,
  accuracyPercent,
  stickersEarned,
  allCharacters,
  onRaceAgain,
  onBackToMath,
}: RaceResultsProps) {
  // Pick a random message based on placement
  const message = useMemo(() => {
    const pool = placement === 1 ? CONGRATULATORY_MESSAGES : SUPPORTIVE_MESSAGES;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [placement]);

  const roundedAccuracy = Math.round(accuracyPercent);

  // Assign characters to podium positions
  // allCharacters[0] is 1st, [1] is 2nd, [2] is 3rd
  const firstPlace = allCharacters[0];
  const secondPlace = allCharacters[1];
  const thirdPlace = allCharacters[2];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-8 gap-6">
      {/* Aria-live region announcing placement and accuracy */}
      <div aria-live="polite" className="sr-only">
        {`You finished in ${getPlacementLabel(placement)} with ${roundedAccuracy}% accuracy.`}
      </div>

      {/* Placement heading */}
      <h1 className="text-kid-large font-bold text-primary text-center animate-bounce">
        {getPlacementLabel(placement)}
      </h1>

      {/* Encouragement message */}
      <p className="text-kid-heading font-semibold text-neutral-700 text-center">
        {message}
      </p>

      {/* Podium */}
      <div className="flex items-end justify-center gap-3 w-full max-w-sm mt-4">
        {/* 2nd place - left, medium height */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-5xl" role="img" aria-label={`${getCharacterLabel(secondPlace)} - 2nd place`}>
            {getCharacterEmoji(secondPlace)}
          </span>
          <div className="w-20 h-20 bg-gray-300 rounded-t-lg flex items-center justify-center">
            <span className="text-kid-body font-bold text-neutral-700">2nd</span>
          </div>
        </div>

        {/* 1st place - center, tallest */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-6xl" role="img" aria-label={`${getCharacterLabel(firstPlace)} - 1st place`}>
            {getCharacterEmoji(firstPlace)}
          </span>
          <div className="w-24 h-28 bg-yellow-400 rounded-t-lg flex items-center justify-center">
            <span className="text-kid-body font-bold text-neutral-800">1st</span>
          </div>
        </div>

        {/* 3rd place - right, shortest */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-4xl" role="img" aria-label={`${getCharacterLabel(thirdPlace)} - 3rd place`}>
            {getCharacterEmoji(thirdPlace)}
          </span>
          <div className="w-20 h-14 bg-orange-300 rounded-t-lg flex items-center justify-center">
            <span className="text-kid-body font-bold text-neutral-700">3rd</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-col items-center gap-2 mt-4">
        <p className="text-kid-heading font-bold text-neutral-800">
          Accuracy: {roundedAccuracy}%
        </p>
        <p className="text-kid-heading font-bold text-neutral-800">
          Stickers: {stickersEarned} ⭐
        </p>
      </div>

      {/* Navigation buttons */}
      <nav className="flex flex-col items-center gap-4 w-full max-w-xs mt-6">
        <TouchButton
          variant="primary"
          className="w-full"
          onClick={onRaceAgain}
          aria-label="Race Again"
        >
          🏁 Race Again
        </TouchButton>

        <TouchButton
          variant="success"
          className="w-full"
          onClick={onBackToMath}
          aria-label="Back to Math"
        >
          📚 Back to Math
        </TouchButton>
      </nav>
    </div>
  );
}
