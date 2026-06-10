'use client';

import React from 'react';
import Link from 'next/link';
import { TouchButton } from '@/components/ui/TouchButton';
import type { Sticker } from '@/types/sticker';

export interface CompletionScreenProps {
  /** The sticker earned upon completing the activity */
  sticker?: Sticker | null;
  /** Href for the next activity (if one exists in the module) */
  nextActivityHref?: string;
  /** Label for the next activity button */
  nextActivityLabel?: string;
  /** Href for the home screen (defaults to "/") */
  homeHref?: string;
}

/**
 * Displayed when a child completes all questions in an activity session.
 * Shows the earned sticker and navigation options.
 */
export function CompletionScreen({
  sticker,
  nextActivityHref,
  nextActivityLabel = 'Next Activity',
  homeHref = '/',
}: CompletionScreenProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-8 gap-8">
      {/* Celebratory heading */}
      <h1 className="text-kid-large font-bold text-primary text-center animate-bounce">
        Well done! 🎉
      </h1>

      {/* Sticker display */}
      {sticker && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-kid-heading font-bold text-neutral-700 text-center">
            You earned a sticker!
          </p>
          <div className="w-40 h-40 rounded-3xl bg-white shadow-lg border-4 border-accent flex items-center justify-center">
            <span className="text-8xl" role="img" aria-label={sticker.name}>
              {sticker.imageUrl}
            </span>
          </div>
          <p className="text-kid-body font-semibold text-neutral-600 text-center">
            {sticker.name}
          </p>
        </div>
      )}

      {/* Navigation buttons */}
      <nav className="flex flex-col items-center gap-4 w-full max-w-xs mt-4">
        {nextActivityHref && (
          <Link href={nextActivityHref} className="w-full">
            <TouchButton variant="primary" className="w-full">
              {nextActivityLabel}
            </TouchButton>
          </Link>
        )}

        <Link href={homeHref} className="w-full">
          <TouchButton variant="success" className="w-full">
            🏠 Home
          </TouchButton>
        </Link>
      </nav>
    </div>
  );
}
