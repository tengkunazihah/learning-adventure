'use client';

import React from 'react';

import { BackButton } from '@/components/ui/BackButton';
import { StatCard } from '@/components/dashboard/StatCard';
import { ProgressChart } from '@/components/dashboard/ProgressChart';
import { computeStats } from '@/features/parent-dashboard/stats-calculator';
import { useProgress } from '@/hooks/useProgress';

const TOTAL_LETTERS = 26;
const TOTAL_NUMBERS = 10;

export default function ParentDashboardPage() {
  const { progress } = useProgress();
  const stats = computeStats(progress);

  const hasActivity = stats.activitiesCompleted > 0;

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <BackButton href="/" label="Home" />
          <h1 className="text-kid-heading font-bold text-neutral-800">
            Parent Dashboard
          </h1>
        </div>

        {!hasActivity ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <span className="text-6xl" aria-hidden="true">
              🌟
            </span>
            <p className="text-kid-heading text-neutral-600 text-center">
              Your child hasn&apos;t started learning yet.
            </p>
            <p className="text-kid-body text-neutral-500 text-center">
              Once they complete their first activity, progress will appear here!
            </p>
          </div>
        ) : (
          <>
            <section aria-label="Statistics">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <StatCard
                  label="Activities Completed"
                  value={stats.activitiesCompleted}
                  emoji="📚"
                />
                <StatCard
                  label="Letters Learned"
                  value={stats.lettersLearned}
                  emoji="🔤"
                />
                <StatCard
                  label="Numbers Mastered"
                  value={stats.numbersMastered}
                  emoji="🔢"
                />
                <StatCard
                  label="Stickers Collected"
                  value={stats.stickersCollected}
                  emoji="⭐"
                />
                <StatCard
                  label="Last Played"
                  value={stats.lastPlayedDate}
                  emoji="📅"
                />
              </div>
            </section>

            <section aria-label="Progress" className="flex flex-col gap-4">
              <h2 className="text-kid-body font-bold text-neutral-700">
                Learning Progress
              </h2>
              <ProgressChart
                label="Letters"
                current={stats.lettersLearned}
                total={TOTAL_LETTERS}
                color="bg-secondary"
              />
              <ProgressChart
                label="Numbers"
                current={stats.numbersMastered}
                total={TOTAL_NUMBERS}
                color="bg-primary"
              />
            </section>
          </>
        )}
      </div>
    </main>
  );
}
