'use client';

import React from 'react';

export interface VisualMathDisplayProps {
  operator: 'addition' | 'subtraction';
  operand1: number;
  operand2: number;
  objectEmoji: string;
}

/**
 * Renders a visual representation of a math problem using emoji objects.
 *
 * Addition: Two groups of emojis separated by a plus symbol.
 * Subtraction: A single row of emojis with the rightmost items crossed out,
 * and minus/equals symbols below.
 */
export function VisualMathDisplay({
  operator,
  operand1,
  operand2,
  objectEmoji,
}: VisualMathDisplayProps) {
  const operatorWord = operator === 'addition' ? 'plus' : 'minus';
  const ariaLabel = `What is ${operand1} ${operatorWord} ${operand2}?`;

  if (operator === 'addition') {
    return (
      <div
        className="flex flex-col items-center gap-4 w-full"
        aria-label={ariaLabel}
        role="img"
      >
        <div className="flex items-center justify-center flex-wrap gap-1">
          {/* Left group: operand1 emojis */}
          <div className="flex flex-wrap items-center gap-1">
            {Array.from({ length: operand1 }, (_, i) => (
              <span
                key={`left-${i}`}
                className="min-w-[48px] min-h-[48px] text-5xl flex items-center justify-center"
                aria-hidden="true"
              >
                {objectEmoji}
              </span>
            ))}
          </div>

          {/* Plus symbol with ≥16px separation */}
          <span
            className="mx-4 text-5xl font-bold text-neutral-700 select-none"
            aria-hidden="true"
          >
            +
          </span>

          {/* Right group: operand2 emojis */}
          <div className="flex flex-wrap items-center gap-1">
            {Array.from({ length: operand2 }, (_, i) => (
              <span
                key={`right-${i}`}
                className="min-w-[48px] min-h-[48px] text-5xl flex items-center justify-center"
                aria-hidden="true"
              >
                {objectEmoji}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Subtraction rendering
  const uncrossedCount = operand1 - operand2;

  return (
    <div
      className="flex flex-col items-center gap-4 w-full"
      aria-label={ariaLabel}
      role="img"
    >
      {/* Single row of operand1 emojis, rightmost operand2 crossed out */}
      <div className="flex flex-wrap items-center justify-center gap-1">
        {Array.from({ length: operand1 }, (_, i) => {
          const isCrossedOut = i >= uncrossedCount;
          return (
            <span
              key={`item-${i}`}
              className={[
                'min-w-[48px] min-h-[48px] text-5xl flex items-center justify-center relative',
                isCrossedOut && 'opacity-50',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-hidden="true"
            >
              {objectEmoji}
              {isCrossedOut && (
                <span
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  aria-hidden="true"
                >
                  <span className="block w-full h-[3px] bg-red-600 rotate-45 absolute" />
                </span>
              )}
            </span>
          );
        })}
      </div>

      {/* Minus and equals symbols below */}
      <div className="flex items-center gap-4">
        <span
          className="text-4xl font-bold text-neutral-700 select-none"
          aria-hidden="true"
        >
          −
        </span>
        <span
          className="text-4xl font-bold text-neutral-700 select-none"
          aria-hidden="true"
        >
          =
        </span>
      </div>
    </div>
  );
}
