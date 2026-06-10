import React from 'react';

export interface ProgressBarProps {
  /** Current progress value */
  current: number;
  /** Total/maximum value */
  total: number;
  /** Tailwind background color class for the fill (default: 'bg-primary') */
  color?: string;
  /** Accessible label describing the progress bar */
  label?: string;
  /** Whether to show the count text (e.g. "3/5") */
  showCount?: boolean;
}

export function ProgressBar({
  current,
  total,
  color = 'bg-primary',
  label = 'Progress',
  showCount = false,
}: ProgressBarProps) {
  const clampedCurrent = Math.max(0, Math.min(current, total));
  const percentage = total > 0 ? (clampedCurrent / total) * 100 : 0;

  return (
    <div className="flex items-center gap-3 w-full">
      <div
        role="progressbar"
        aria-valuenow={clampedCurrent}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={label}
        className="relative w-full h-5 bg-neutral-200 rounded-full overflow-hidden"
      >
        <div
          className={[
            'h-full rounded-full',
            'transition-all duration-500 ease-out',
            color,
          ].join(' ')}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showCount && (
        <span className="text-kid-body font-bold text-neutral-700 whitespace-nowrap">
          {clampedCurrent}/{total}
        </span>
      )}
    </div>
  );
}
