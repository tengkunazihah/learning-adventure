'use client';

import React from 'react';
import Link from 'next/link';

export interface NavigationCardProps {
  /** Route to navigate to when the card is tapped */
  href: string;
  /** Text label displayed on the card (max 20 chars) */
  label: string;
  /** Tailwind background color class (e.g. 'bg-card-math') */
  color: string;
  /** Icon element conveying the card's purpose without reading */
  icon: React.ReactNode;
  /** Optional additional CSS classes */
  className?: string;
}

export function NavigationCard({
  href,
  label,
  color,
  icon,
  className = '',
}: NavigationCardProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={[
        'min-w-touch min-h-[200px]',
        'flex flex-col items-center justify-center gap-4',
        'rounded-3xl shadow-lg p-8',
        'transition-transform duration-100',
        'active:scale-95',
        'focus:outline-none focus:ring-4 focus:ring-accent',
        'text-kid-heading font-bold text-white',
        color,
        className,
      ].join(' ')}
    >
      <span className="text-6xl" aria-hidden="true">
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
}
