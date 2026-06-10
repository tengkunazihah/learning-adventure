'use client';

import React from 'react';

export type AnswerOptionState = 'idle' | 'correct' | 'incorrect';

export interface AnswerOptionProps {
  /** Unique identifier for the option */
  id: string;
  /** Display text for the option */
  label: string;
  /** Optional image URL to display alongside or instead of label */
  imageUrl?: string;
  /** Callback fired when the option is selected */
  onSelect: (id: string) => void;
  /** Visual state of the option */
  state?: AnswerOptionState;
  /** Whether the option is disabled (e.g. after correct answer) */
  disabled?: boolean;
  /** Optional custom class for the label text (e.g. larger emoji rendering) */
  labelClassName?: string;
}

const stateStyles: Record<AnswerOptionState, string> = {
  idle: 'bg-white border-2 border-neutral-300 hover:border-secondary hover:shadow-md',
  correct:
    'bg-success/20 border-3 border-success animate-[pulse-pop_0.5s_ease-in-out]',
  incorrect:
    'bg-amber-50 border-2 border-amber-300 animate-[gentle-shake_0.4s_ease-in-out]',
};

export function AnswerOption({
  id,
  label,
  imageUrl,
  onSelect,
  state = 'idle',
  disabled = false,
  labelClassName,
}: AnswerOptionProps) {
  const handleClick = () => {
    if (!disabled) {
      onSelect(id);
    }
  };

  return (
    <button
      type="button"
      role="button"
      aria-label={`Answer: ${label}`}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={handleClick}
      className={[
        'min-w-touch min-h-touch',
        'rounded-2xl font-bold text-kid-body',
        'transition-all duration-150',
        'active:scale-95',
        'focus:outline-none focus:ring-4 focus:ring-accent',
        'disabled:pointer-events-none',
        'flex flex-col items-center justify-center gap-2 p-4',
        'cursor-pointer select-none',
        stateStyles[state],
        state === 'correct' && 'text-green-800',
        state === 'incorrect' && 'text-amber-800',
        state === 'idle' && 'text-neutral-800',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt={label}
          className="w-12 h-12 object-contain"
          aria-hidden="true"
        />
      )}
      <span className={labelClassName ?? "text-kid-heading leading-tight text-center"}>
        {label}
      </span>
    </button>
  );
}
