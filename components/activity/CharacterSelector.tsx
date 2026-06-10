'use client';

import React from 'react';
import { RACE_CHARACTERS } from '@/lib/constants';
import type { RaceCharacter } from '@/features/math/math-race';

export interface CharacterSelectorProps {
  selectedCharacter: RaceCharacter | null;
  onSelect: (character: RaceCharacter) => void;
  onStartRace: () => void;
}

/**
 * CharacterSelector displays 3 tappable character cards for the child
 * to choose their racer before the race begins.
 *
 * - Each card has a minimum 48×48px touch target
 * - Selected character gets a scale/border highlight
 * - "Start Race" button is disabled until a character is selected
 * - An aria-live region announces the selected character
 */
export function CharacterSelector({
  selectedCharacter,
  onSelect,
  onStartRace,
}: CharacterSelectorProps) {
  return (
    <div className="flex flex-col items-center gap-8 p-6">
      <h2 className="text-kid-large font-bold text-primary text-center">
        Choose Your Racer!
      </h2>

      <div className="flex flex-wrap justify-center gap-6">
        {RACE_CHARACTERS.map((character) => {
          const isSelected = selectedCharacter === character.id;

          return (
            <button
              key={character.id}
              type="button"
              aria-label={`Select ${character.label}`}
              aria-pressed={isSelected}
              onClick={() => onSelect(character.id as RaceCharacter)}
              className={[
                'min-w-[80px] min-h-[80px]',
                'flex flex-col items-center justify-center gap-2 p-4',
                'rounded-2xl font-bold text-kid-body',
                'transition-all duration-200',
                'cursor-pointer select-none',
                'focus:outline-none focus:ring-4 focus:ring-accent',
                'active:scale-95',
                isSelected
                  ? 'border-4 border-primary bg-primary/10 scale-110 shadow-lg'
                  : 'border-2 border-neutral-300 bg-white hover:border-secondary hover:shadow-md',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className="text-5xl" aria-hidden="true">
                {character.emoji}
              </span>
              <span className="text-kid-body font-semibold text-neutral-800">
                {character.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Aria-live region to announce selected character */}
      <div aria-live="polite" className="sr-only">
        {selectedCharacter
          ? `${RACE_CHARACTERS.find((c) => c.id === selectedCharacter)?.label} selected`
          : ''}
      </div>

      <button
        type="button"
        onClick={onStartRace}
        disabled={!selectedCharacter}
        aria-disabled={!selectedCharacter}
        className={[
          'min-w-touch min-h-touch',
          'px-8 py-4 rounded-2xl font-bold text-kid-body',
          'transition-all duration-200',
          'focus:outline-none focus:ring-4 focus:ring-accent',
          selectedCharacter
            ? 'bg-primary text-white hover:bg-primary/90 active:scale-95 cursor-pointer shadow-md'
            : 'bg-neutral-200 text-neutral-400 cursor-not-allowed',
        ].join(' ')}
      >
        Start Race 🏁
      </button>
    </div>
  );
}
