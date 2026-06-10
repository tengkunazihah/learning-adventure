'use client';

import React from 'react';
import Link from 'next/link';

export interface BackButtonProps {
  /** Route to navigate back to */
  href: string;
  /** Optional label text (defaults to "Back") */
  label?: string;
  /** Optional additional CSS classes */
  className?: string;
}

export function BackButton({
  href,
  label = 'Back',
  className = '',
}: BackButtonProps) {
  return (
    <Link
      href={href}
      aria-label={`Go back to ${label}`}
      className={[
        'min-w-touch min-h-touch',
        'inline-flex items-center gap-2 px-4',
        'rounded-2xl bg-neutral-100 hover:bg-neutral-200',
        'text-kid-body font-bold text-neutral-700',
        'transition-transform duration-100',
        'active:scale-95',
        'focus:outline-none focus:ring-4 focus:ring-accent',
        className,
      ].join(' ')}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6"
        aria-hidden="true"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
      <span>{label}</span>
    </Link>
  );
}
