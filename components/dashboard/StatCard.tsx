import React from 'react';

export interface StatCardProps {
  /** Descriptive label for the metric */
  label: string;
  /** The metric value to display prominently */
  value: string | number;
  /** Optional emoji displayed above the value */
  emoji?: string;
}

export function StatCard({ label, value, emoji }: StatCardProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-white p-4 shadow-md">
      {emoji && (
        <span className="text-3xl" aria-hidden="true">
          {emoji}
        </span>
      )}
      <span className="text-kid-heading font-bold text-neutral-800">
        {value}
      </span>
      <span className="text-kid-body text-neutral-600 text-center">
        {label}
      </span>
    </div>
  );
}
