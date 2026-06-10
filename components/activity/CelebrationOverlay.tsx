'use client';

import React from 'react';

export interface CelebrationOverlayProps {
  /** Whether the celebration overlay is currently showing */
  isActive: boolean;
  /** The encouraging message to display, or null */
  message: string | null;
}

/** Predefined star positions for the animation (avoids Math.random in render). */
const STAR_POSITIONS = [
  { left: '10%', top: '20%', delay: '0s' },
  { left: '25%', top: '10%', delay: '0.1s' },
  { left: '40%', top: '30%', delay: '0.2s' },
  { left: '55%', top: '15%', delay: '0.15s' },
  { left: '70%', top: '25%', delay: '0.05s' },
  { left: '85%', top: '12%', delay: '0.25s' },
  { left: '15%', top: '50%', delay: '0.3s' },
  { left: '50%', top: '55%', delay: '0.1s' },
  { left: '75%', top: '45%', delay: '0.2s' },
  { left: '35%', top: '65%', delay: '0.35s' },
  { left: '60%', top: '70%', delay: '0.15s' },
  { left: '90%', top: '55%', delay: '0.05s' },
];

/**
 * CelebrationOverlay displays animated stars and an encouraging message
 * when a child answers correctly. The overlay is non-blocking (pointer-events: none)
 * so it does not interfere with touch interactions underneath.
 */
export function CelebrationOverlay({ isActive, message }: CelebrationOverlayProps) {
  if (!isActive) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
      aria-live="polite"
      role="status"
    >
      {/* Animated stars */}
      {STAR_POSITIONS.map((pos, index) => (
        <span
          key={index}
          className="absolute text-4xl animate-star-float"
          style={{
            left: pos.left,
            top: pos.top,
            animationDelay: pos.delay,
          }}
          aria-hidden="true"
        >
          ⭐
        </span>
      ))}

      {/* Encouraging message */}
      {message && (
        <div className="relative z-10 bg-white/90 rounded-3xl px-8 py-4 shadow-lg animate-pulse-pop">
          <p className="text-kid-large font-bold text-primary text-center">
            {message}
          </p>
        </div>
      )}
    </div>
  );
}
