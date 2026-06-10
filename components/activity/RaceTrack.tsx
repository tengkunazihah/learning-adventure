'use client';

import React, { useMemo } from 'react';
import { RACE_CHARACTERS } from '@/lib/constants';
import type { RaceCharacter } from '@/features/math/math-race';

export interface RaceTrackProps {
  playerCharacter: RaceCharacter;
  playerPosition: number;
  opponent1Character: RaceCharacter;
  opponent1Position: number;
  opponent2Character: RaceCharacter;
  opponent2Position: number;
  reducedMotion: boolean;
}

/** Lane background styles — swimming theme with blue gradients */
const LANE_STYLES = [
  'bg-gradient-to-r from-blue-300 to-blue-400',
  'bg-gradient-to-r from-blue-400 to-blue-500',
  'bg-gradient-to-r from-blue-300 to-blue-500',
] as const;

/**
 * Helper to get the emoji for a given character id.
 */
function getCharacterEmoji(character: RaceCharacter): string {
  const found = RACE_CHARACTERS.find((c) => c.id === character);
  return found?.emoji ?? '❓';
}

/**
 * Helper to get the label for a given character id.
 */
function getCharacterLabel(character: RaceCharacter): string {
  const found = RACE_CHARACTERS.find((c) => c.id === character);
  return found?.label ?? character;
}

/**
 * Determine ordinal position string (1st, 2nd, 3rd) based on positions.
 */
function getOrdinalPlace(
  playerPosition: number,
  opponent1Position: number,
  opponent2Position: number
): string {
  let place = 1;
  if (opponent1Position > playerPosition) place++;
  if (opponent2Position > playerPosition) place++;

  switch (place) {
    case 1:
      return '1st';
    case 2:
      return '2nd';
    case 3:
      return '3rd';
    default:
      return `${place}th`;
  }
}

/**
 * RaceTrack renders a horizontal 3-lane swimming race track.
 *
 * - 3 lanes arranged vertically (top to bottom), one per character
 * - Swimming theme with blue gradient backgrounds
 * - Characters positioned via CSS translateX based on their progress percentage
 * - Start line (0%) and finish line (100%) visually marked
 * - Player character distinguished with a golden ring
 * - CSS transitions for smooth movement (300ms default), respecting prefers-reduced-motion
 * - aria-live region announces player position updates
 */
export function RaceTrack({
  playerCharacter,
  playerPosition,
  opponent1Character,
  opponent1Position,
  opponent2Character,
  opponent2Position,
  reducedMotion,
}: RaceTrackProps) {
  const lanes = useMemo(
    () => [
      {
        character: playerCharacter,
        position: playerPosition,
        isPlayer: true,
      },
      {
        character: opponent1Character,
        position: opponent1Position,
        isPlayer: false,
      },
      {
        character: opponent2Character,
        position: opponent2Position,
        isPlayer: false,
      },
    ],
    [
      playerCharacter,
      playerPosition,
      opponent1Character,
      opponent1Position,
      opponent2Character,
      opponent2Position,
    ]
  );

  const playerPlace = getOrdinalPlace(
    playerPosition,
    opponent1Position,
    opponent2Position
  );

  const playerLabel = getCharacterLabel(playerCharacter);

  return (
    <div className="w-full max-w-3xl mx-auto px-2" role="img" aria-label="Race track with three swimming lanes">
      {/* Track container */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-blue-600 shadow-lg">
        {/* Start and finish line overlays */}
        <div
          className="absolute top-0 bottom-0 left-0 w-1 bg-green-500 z-10"
          aria-hidden="true"
        />
        <div
          className="absolute top-0 bottom-0 right-0 w-1 bg-red-500 z-10"
          aria-hidden="true"
        />

        {/* Start label */}
        <div
          className="absolute top-0 left-1 text-xs font-bold text-green-700 z-10"
          aria-hidden="true"
        >
          START
        </div>
        {/* Finish label */}
        <div
          className="absolute top-0 right-1 text-xs font-bold text-red-700 z-10"
          aria-hidden="true"
        >
          FINISH
        </div>

        {/* Lanes */}
        {lanes.map((lane, index) => (
          <div
            key={lane.character}
            className={[
              'relative h-20 flex items-center',
              LANE_STYLES[index],
              index < lanes.length - 1 ? 'border-b-2 border-blue-600/40' : '',
            ].join(' ')}
          >
            {/* Wave decoration */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              aria-hidden="true"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,0.3) 20px, rgba(255,255,255,0.3) 40px)',
              }}
            />

            {/* Character */}
            <div
              className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center"
              style={{
                left: `${Math.max(0, Math.min(100, lane.position))}%`,
                transform: `translateX(-50%) translateY(-50%)`,
                transition: reducedMotion ? 'none' : 'left 300ms ease-in-out',
              }}
            >
              <div
                className={[
                  'flex items-center justify-center w-12 h-12 rounded-full text-3xl',
                  lane.isPlayer
                    ? 'ring-4 ring-yellow-400 bg-yellow-100 shadow-md'
                    : 'bg-white/60',
                ].join(' ')}
                aria-label={`${getCharacterLabel(lane.character)}${lane.isPlayer ? ' (you)' : ''}`}
              >
                {getCharacterEmoji(lane.character)}
              </div>
              {/* Player crown indicator */}
              {lane.isPlayer && (
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 text-sm"
                  aria-hidden="true"
                >
                  👑
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Aria-live region announcing player position */}
      <div aria-live="polite" className="sr-only">
        {`Your ${playerLabel} is in ${playerPlace} place`}
      </div>
    </div>
  );
}
