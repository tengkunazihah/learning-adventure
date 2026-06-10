import React from 'react';

export interface QuestionDisplayProps {
  /** The question prompt text (e.g., "How many animals do you see?") */
  prompt: string;
  /** Optional visual content rendered below the prompt (images, shapes, emoji, etc.) */
  children?: React.ReactNode;
}

/**
 * Displays the question prompt in large kid-friendly text
 * with optional visual content below it.
 */
export function QuestionDisplay({ prompt, children }: QuestionDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <p className="text-kid-large font-bold text-neutral-800 text-center leading-tight">
        {prompt}
      </p>
      {children && <div className="flex items-center justify-center">{children}</div>}
    </div>
  );
}
