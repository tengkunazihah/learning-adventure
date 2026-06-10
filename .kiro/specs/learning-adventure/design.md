# Design Document

## Overview

Learning Adventure is an iPad-first educational PWA built with Next.js 15 (App Router), TypeScript, and Tailwind CSS. The application uses a component-based architecture with feature modules for Math, English, Rewards, and Parent Dashboard. State management relies on React Context for in-session state and Local Storage for persistence. The app uses the Web Speech API for audio feedback and CSS animations for celebration effects.

## Architecture

### Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with custom theme for kid-friendly colors
- **State Management**: React Context + useReducer for activity state; Local Storage for persistence
- **Audio**: Web Speech Synthesis API for text-to-speech; HTML5 Audio for sound effects
- **Animations**: CSS animations + Framer Motion for celebration effects
- **PWA**: next-pwa or custom service worker configuration
- **Testing**: Vitest + React Testing Library + fast-check for property-based tests

### Project Structure

```
app/
├── layout.tsx                    # Root layout with PWA meta, fonts
├── page.tsx                      # Home screen with 4 navigation cards
├── math/
│   ├── page.tsx                  # Math module hub
│   ├── count-animals/page.tsx    # Count the Animals activity
│   ├── number-matching/page.tsx  # Number Matching activity
│   └── shape-hunt/page.tsx       # Shape Hunt activity
├── english/
│   ├── page.tsx                  # English module hub
│   ├── letter-recognition/page.tsx
│   ├── beginning-sounds/page.tsx
│   └── first-words/page.tsx
├── sticker-book/page.tsx         # Sticker collection view
└── parent-dashboard/page.tsx     # Parent progress view

components/
├── ui/
│   ├── TouchButton.tsx           # Base touch-friendly button (80x80 min)
│   ├── NavigationCard.tsx        # Home screen card component
│   ├── AnswerOption.tsx          # Activity answer choice button
│   ├── ProgressBar.tsx           # Progress visualization
│   └── BackButton.tsx            # Navigation back button
├── activity/
│   ├── ActivityShell.tsx         # Shared activity layout wrapper
│   ├── QuestionDisplay.tsx       # Question text/image display
│   ├── CompletionScreen.tsx      # End-of-activity sticker award
│   └── CelebrationOverlay.tsx    # Stars animation + sound
├── rewards/
│   ├── StickerGrid.tsx           # Sticker book grid layout
│   └── StickerCard.tsx           # Individual sticker display
└── dashboard/
    ├── StatCard.tsx              # Single metric display
    └── ProgressChart.tsx         # Chart/bar visualization

features/
├── math/
│   ├── count-animals.ts          # Question generation logic
│   ├── number-matching.ts        # Question generation logic
│   └── shape-hunt.ts             # Question generation logic
├── english/
│   ├── letter-recognition.ts     # Question generation logic
│   ├── beginning-sounds.ts       # Question generation logic
│   └── first-words.ts            # Word data and logic
├── rewards/
│   ├── sticker-engine.ts         # Sticker award logic
│   └── sticker-data.ts           # Sticker category definitions
└── parent-dashboard/
    └── stats-calculator.ts       # Progress computation logic

hooks/
├── useProgress.ts                # Progress context consumer hook
├── useSpeech.ts                  # Speech synthesis wrapper
├── useAudio.ts                   # Sound effect player
├── useCelebration.ts             # Celebration trigger logic
└── useActivitySession.ts         # Session timer and question flow

lib/
├── storage.ts                    # Local Storage abstraction layer
├── speech.ts                     # Speech synthesis utilities
├── random.ts                     # Randomization utilities
└── constants.ts                  # App-wide constants

types/
├── activity.ts                   # Activity, Question, Answer types
├── progress.ts                   # Progress and mastery types
├── sticker.ts                    # Sticker and reward types
└── speech.ts                     # Speech configuration types
```

### Data Flow

```
User Interaction → Activity Component → useActivitySession hook
    ↓                                         ↓
Answer Selection → Correct/Incorrect check → useCelebration / encouragement
    ↓                                         ↓
Activity Complete → Sticker Engine → useProgress → storage.ts → Local Storage
    ↓
Completion Screen → Navigate Home or Next Activity
```

## Components

### Core Type Definitions

```typescript
// types/activity.ts
interface Question {
  id: string;
  type: ActivityType;
  prompt: string;
  options: AnswerOption[];
  correctOptionId: string;
  speechText: string;
}

interface AnswerOption {
  id: string;
  label: string;
  imageUrl?: string;
  value: number | string;
}

type ActivityType =
  | 'count-animals'
  | 'number-matching'
  | 'shape-hunt'
  | 'letter-recognition'
  | 'beginning-sounds'
  | 'first-words';

interface ActivitySession {
  activityType: ActivityType;
  questions: Question[];
  currentIndex: number;
  correctCount: number;
  startedAt: number;
  completedAt?: number;
}

// types/progress.ts
interface ProgressData {
  activitiesCompleted: number;
  lettersLearned: string[];
  numbersMastered: number[];
  stickersCollected: Sticker[];
  lastPlayedDate: string;
  activityHistory: ActivityRecord[];
}

interface ActivityRecord {
  activityType: ActivityType;
  completedAt: string;
  correctAnswers: number;
  totalQuestions: number;
}

// types/sticker.ts
type StickerCategory = 'animals' | 'stars' | 'dinosaurs' | 'vehicles' | 'fruits';

interface Sticker {
  id: string;
  name: string;
  category: StickerCategory;
  imageUrl: string;
  earnedAt: string;
}
```

### Question Generation (features/math/count-animals.ts)

```typescript
interface CountAnimalsConfig {
  minCount: 1;
  maxCount: 10;
  optionCount: 4;
  animalTypes: string[];
}

function generateCountAnimalsQuestion(config: CountAnimalsConfig): Question {
  // 1. Pick random count between 1-10
  // 2. Pick random animal type
  // 3. Generate 4 unique answer options including correct one
  // 4. Shuffle options
  // Return structured Question
}
```

### Storage Layer (lib/storage.ts)

```typescript
interface StorageAdapter {
  save(key: string, data: unknown): void;
  load<T>(key: string): T | null;
  clear(): void;
  isAvailable(): boolean;
}

// Implements save/load with JSON serialization
// Falls back to in-memory Map if Local Storage unavailable
```

### Speech Utilities (lib/speech.ts)

```typescript
interface SpeechConfig {
  rate: number;    // 0.8 for child-friendly pace
  pitch: number;   // 1.1 for friendly tone
  volume: number;  // 1.0
}

function speak(text: string, config?: Partial<SpeechConfig>): void;
function isSpeechSupported(): boolean;
```

### Activity Session Hook (hooks/useActivitySession.ts)

```typescript
interface UseActivitySessionReturn {
  currentQuestion: Question | null;
  questionIndex: number;
  totalQuestions: number;
  isComplete: boolean;
  handleAnswer: (optionId: string) => void;
  reset: () => void;
}

function useActivitySession(
  activityType: ActivityType,
  questionGenerator: () => Question[]
): UseActivitySessionReturn;
```

## Correctness Properties

### Property 1: Question Generation Always Produces Valid Count Range

**Requirement Refs:** 2.1, 3.1

**Property:** For all generated Count the Animals and Number Matching questions, the target count is always between 1 and 10 inclusive.

**Test approach:** Property-based test using fast-check to generate random seeds and verify the count constraint holds across hundreds of generated questions.

```
FOR ALL seeds s:
  generateCountAnimalsQuestion(s).correctAnswer >= 1
  AND generateCountAnimalsQuestion(s).correctAnswer <= 10
```

### Property 2: Answer Options Always Contain Correct Answer

**Requirement Refs:** 2.3, 3.2, 4.2, 5.2, 6.1

**Property:** For all generated questions across all activity types, the list of answer options always contains exactly one option matching the correct answer.

**Test approach:** Property-based test generating questions for each activity type and verifying the options array includes the correct answer exactly once.

```
FOR ALL questions q generated by any activity:
  q.options.filter(o => o.id === q.correctOptionId).length === 1
```

### Property 3: Answer Options Are Always Distinct

**Requirement Refs:** 2.3, 3.2, 5.2

**Property:** For all generated questions, all answer option values are unique (no duplicate choices).

**Test approach:** Property-based test verifying that option values form a set with no duplicates.

```
FOR ALL questions q:
  new Set(q.options.map(o => o.value)).size === q.options.length
```

### Property 4: Progress Data Round-Trip Persistence

**Requirement Refs:** 8.4, 10.7, 14.1, 14.4

**Property:** For all valid ProgressData objects, saving to storage then loading produces an equivalent object.

**Test approach:** Property-based test generating arbitrary valid ProgressData, serializing to Local Storage, deserializing, and asserting deep equality.

```
FOR ALL valid progressData p:
  storage.save('progress', p)
  storage.load<ProgressData>('progress') deepEquals p
```

### Property 5: Score Never Decreases (No Penalty Invariant)

**Requirement Refs:** 9.4

**Property:** For any sequence of answers (correct or incorrect), the correctCount in an ActivitySession never decreases.

**Test approach:** Property-based test generating random sequences of correct/incorrect answers and verifying the score is monotonically non-decreasing.

```
FOR ALL answer sequences [a1, a2, ..., aN]:
  FOR ALL i where 1 <= i < N:
    session.correctCount after processing a[i+1] >= session.correctCount after processing a[i]
```

### Property 6: Sticker Award Exactly One Per Completion

**Requirement Refs:** 8.1

**Property:** For all activity completions, exactly one sticker is added to the collection.

**Test approach:** Property-based test simulating activity completions and verifying the sticker count increases by exactly 1 each time.

```
FOR ALL activity completions:
  stickersAfter.length === stickersBefore.length + 1
```

### Property 7: Encouraging Message Always From Valid Set

**Requirement Refs:** 9.3

**Property:** For all correct answer celebrations, the displayed message is always one of: "Great job!", "Awesome!", "Well done!", "Fantastic!".

**Test approach:** Property-based test generating correct answer events and verifying the selected message belongs to the defined set.

```
FOR ALL correct answers:
  getEncouragingMessage() IN ["Great job!", "Awesome!", "Well done!", "Fantastic!"]
```

### Property 8: Generated Letter Is Always Valid Uppercase A-Z

**Requirement Refs:** 5.1

**Property:** For all Letter Recognition questions, the target letter is always a single uppercase character from A to Z.

**Test approach:** Property-based test generating letter recognition questions and verifying the target matches /^[A-Z]$/.

```
FOR ALL letter recognition questions q:
  q.targetLetter.match(/^[A-Z]$/) !== null
```

### Property 9: Shape Options Always Include Target Shape

**Requirement Refs:** 4.2

**Property:** For all Shape Hunt questions, the displayed shapes always include the target shape that the child is asked to find.

**Test approach:** Property-based test generating shape hunt questions and verifying the target shape appears in the options.

```
FOR ALL shape hunt questions q:
  q.options.includes(q.targetShape) === true
```

### Property 10: Question Order Is Randomized (Non-Deterministic)

**Requirement Refs:** 15.4

**Property:** For all activity sessions with more than one question, generating questions multiple times with different seeds produces different orderings.

**Test approach:** Statistical property test - generate sessions many times and verify that not all orderings are identical (with high probability).

```
FOR sufficient sample size (e.g., 10 generations):
  NOT ALL orderings are identical
```

## PWA Configuration

### Web App Manifest (public/manifest.json)

```json
{
  "name": "Learning Adventure",
  "short_name": "LearnAdv",
  "description": "Fun learning for kids aged 4-5",
  "start_url": "/",
  "display": "standalone",
  "orientation": "landscape",
  "background_color": "#FFF8E1",
  "theme_color": "#FF6B35",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Service Worker Strategy

- Cache static assets (JS, CSS, images, audio) on install
- Network-first for HTML pages
- Cache-first for images and audio files
- No API caching needed (no backend)

## Tailwind Theme Extension

```typescript
// tailwind.config.ts (partial)
theme: {
  extend: {
    colors: {
      primary: '#FF6B35',     // Warm orange
      secondary: '#4ECDC4',   // Teal
      accent: '#FFE66D',      // Bright yellow
      success: '#7BC950',     // Green for correct
      background: '#FFF8E1',  // Warm cream
      card: {
        math: '#FF6B6B',      // Coral red
        english: '#4ECDC4',   // Teal
        stickers: '#FFE66D',  // Yellow
        parent: '#95E1D3',    // Mint
      }
    },
    minWidth: {
      'touch': '80px',
    },
    minHeight: {
      'touch': '80px',
    },
    fontSize: {
      'kid-body': '18px',
      'kid-heading': '28px',
      'kid-large': '48px',
    }
  }
}
```

## Error Handling

| Scenario | Handling |
|----------|----------|
| Speech synthesis unavailable | Show visual-only instructions, hide audio controls |
| Local Storage full/unavailable | Fall back to in-memory state, warn parent on dashboard |
| Audio file fails to load | Continue without sound, show visual celebration only |
| Service worker registration fails | App works normally without offline support |

## Performance Considerations

- Lazy load activity modules (Next.js dynamic imports)
- Preload audio files for current activity
- Use CSS animations over JS animations where possible
- Optimize images with Next.js Image component
- Keep bundle size minimal for offline caching
