import React from 'react';

import { ProgressBar } from '@/components/ui/ProgressBar';

export interface ProgressChartProps {
  /** Label describing what is being measured */
  label: string;
  /** Current progress value */
  current: number;
  /** Maximum/total value */
  total: number;
  /** Optional Tailwind color class for the bar fill */
  color?: string;
}

/**
 * A labeled wrapper around ProgressBar that also displays
 * the current/total as a percentage text.
 */
export function ProgressChart({
  label,
  current,
  total,
  color,
}: ProgressChartProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-kid-body font-bold text-neutral-700">
          {label}
        </span>
        <span className="text-kid-body text-neutral-500">
          {current}/{total} ({percentage}%)
        </span>
      </div>
      <ProgressBar
        current={current}
        total={total}
        color={color}
        label={label}
        showCount={false}
      />
    </div>
  );
}
