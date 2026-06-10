'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';

import { createStorage } from '@/lib/storage';
import type { StorageAdapter } from '@/lib/storage';
import type { ActivityType } from '@/types/activity';
import type { ActivityRecord, ProgressData } from '@/types/progress';
import type { Sticker } from '@/types/sticker';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'learning-adventure-progress';

/** Default empty progress state used on first load or when data is corrupted. */
export const DEFAULT_PROGRESS: ProgressData = {
  activitiesCompleted: 0,
  lettersLearned: [],
  numbersMastered: [],
  stickersCollected: [],
  lastPlayedDate: '',
  activityHistory: [],
};

// ---------------------------------------------------------------------------
// Context types
// ---------------------------------------------------------------------------

interface ProgressContextValue {
  progress: ProgressData;
  recordActivityCompletion: (
    activityType: ActivityType,
    correctAnswers: number,
    totalQuestions: number
  ) => void;
  recordLetterLearned: (letter: string) => void;
  recordNumberMastered: (num: number) => void;
  addSticker: (sticker: Sticker) => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

// ---------------------------------------------------------------------------
// Validation helper
// ---------------------------------------------------------------------------

/**
 * Basic validation to confirm loaded data has the expected shape.
 * If corrupted or missing fields, returns false so we discard and use defaults.
 */
function isValidProgressData(data: unknown): data is ProgressData {
  if (data === null || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.activitiesCompleted === 'number' &&
    Array.isArray(d.lettersLearned) &&
    Array.isArray(d.numbersMastered) &&
    Array.isArray(d.stickersCollected) &&
    typeof d.lastPlayedDate === 'string' &&
    Array.isArray(d.activityHistory)
  );
}

// ---------------------------------------------------------------------------
// Provider component
// ---------------------------------------------------------------------------

interface ProgressProviderProps {
  children: ReactNode;
  /** Optional override for testing — allows injecting a mock storage adapter. */
  storageAdapter?: StorageAdapter;
}

export function ProgressProvider({
  children,
  storageAdapter,
}: ProgressProviderProps) {
  // Create storage adapter once
  const storageRef = useRef<StorageAdapter>(
    storageAdapter ?? createStorage()
  );

  // Load initial state from storage (or defaults if unavailable/corrupted)
  const [progress, setProgress] = useState<ProgressData>(() => {
    const stored = storageRef.current.load<ProgressData>(STORAGE_KEY);
    if (stored && isValidProgressData(stored)) {
      return stored;
    }
    if (stored !== null) {
      // Data was present but corrupted — already logged by storage adapter
      console.error(
        '[Progress] Stored data failed validation, initializing with defaults.'
      );
    }
    return DEFAULT_PROGRESS;
  });

  // Persist to storage on every state change (Req 14.1 — within 1 second)
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    storageRef.current.save(STORAGE_KEY, progress);
  }, [progress]);

  // ------ Action functions ------

  const recordActivityCompletion = useCallback(
    (
      activityType: ActivityType,
      correctAnswers: number,
      totalQuestions: number
    ) => {
      setProgress((prev) => {
        const record: ActivityRecord = {
          activityType,
          completedAt: new Date().toISOString(),
          correctAnswers,
          totalQuestions,
        };
        return {
          ...prev,
          activitiesCompleted: prev.activitiesCompleted + 1,
          lastPlayedDate: new Date().toISOString(),
          activityHistory: [...prev.activityHistory, record],
        };
      });
    },
    []
  );

  const recordLetterLearned = useCallback((letter: string) => {
    setProgress((prev) => {
      if (prev.lettersLearned.includes(letter)) {
        return prev; // Already tracked — no duplicate
      }
      return {
        ...prev,
        lettersLearned: [...prev.lettersLearned, letter],
      };
    });
  }, []);

  const recordNumberMastered = useCallback((num: number) => {
    setProgress((prev) => {
      if (prev.numbersMastered.includes(num)) {
        return prev; // Already tracked — no duplicate
      }
      return {
        ...prev,
        numbersMastered: [...prev.numbersMastered, num],
      };
    });
  }, []);

  const addSticker = useCallback((sticker: Sticker) => {
    setProgress((prev) => ({
      ...prev,
      stickersCollected: [...prev.stickersCollected, sticker],
    }));
  }, []);

  // ------ Context value ------

  const value: ProgressContextValue = {
    progress,
    recordActivityCompletion,
    recordLetterLearned,
    recordNumberMastered,
    addSticker,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Consumer hook
// ---------------------------------------------------------------------------

/**
 * Consumes the ProgressContext. Must be used within a ProgressProvider.
 */
export function useProgress(): ProgressContextValue {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
