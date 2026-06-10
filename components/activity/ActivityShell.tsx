import React from 'react';
import { BackButton } from '@/components/ui/BackButton';
import { ProgressBar } from '@/components/ui/ProgressBar';

export interface ActivityShellProps {
  /** Content rendered in the main area (question display, answer options, etc.) */
  children: React.ReactNode;
  /** Route for the back button navigation */
  backHref: string;
  /** Optional label for the back button (defaults to "Back") */
  backLabel?: string;
  /** Zero-based index of the current question */
  questionIndex: number;
  /** Total number of questions in the session */
  totalQuestions: number;
  /** Optional title displayed in the top bar center */
  title?: string;
}

export function ActivityShell({
  children,
  backHref,
  backLabel,
  questionIndex,
  totalQuestions,
  title,
}: ActivityShellProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-3 gap-4">
        <BackButton href={backHref} label={backLabel} />

        {title && (
          <h1 className="text-kid-heading font-bold text-neutral-800 truncate text-center flex-1">
            {title}
          </h1>
        )}

        <div className="w-48 shrink-0">
          <ProgressBar
            current={questionIndex + 1}
            total={totalQuestions}
            showCount
          />
        </div>
      </header>

      {/* Content area */}
      <main className="flex-1 flex items-center justify-center px-4 pb-4">
        {children}
      </main>
    </div>
  );
}
