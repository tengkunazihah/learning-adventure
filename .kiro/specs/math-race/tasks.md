# Implementation Plan: Math Race

## Overview

Implement the Math Race activity — a gamified arithmetic practice feature where children select a character and race against opponents by answering addition/subtraction questions. The implementation follows the existing page → hook → feature-module architecture, creating a new engine module, a custom race session hook, three new UI components, and wiring into the existing math hub and progress/sticker systems.

## Tasks

- [x] 1. Set up types, constants, and project structure
  - [x] 1.1 Extend ActivityType and add race constants
    - Add `'math-race'` to the `ActivityType` union in `types/activity.ts`
    - Add `RACE_CHARACTERS`, `PLACEMENT_THRESHOLDS`, `PLACEMENT_STICKER_REWARDS`, `CELEBRATION_DURATION_MS`, and `OPPONENT_POSITION_CAP` constants to `lib/constants.ts`
    - Export `RaceCharacter` and `Placement` types from `features/math/math-race.ts` (can be a stub initially)
    - _Requirements: 10.3, 1.1_

  - [x] 1.2 Create the Math Race Engine with question generation
    - Create `features/math/math-race.ts`
    - Implement `generateRaceQuestion()`: randomly selects addition/subtraction, picks operands in [1,10], ensures subtraction result ≥ 0, computes correct answer, generates speechText in "What is X plus/minus Y?" format
    - Implement `generateRaceDistractors(correctAnswer, count)`: generates distractor values within ±3, clamped to [0,20], expanding range if fewer than 3 candidates exist
    - Implement `generateRaceQuestions(count)`: returns array of `count` questions each with 4 shuffled unique options
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ]* 1.3 Write property test: valid operands, result, and operation (Property 1)
    - **Property 1: Generated questions have valid operands, result, and operation**
    - **Validates: Requirements 2.1, 2.5**

  - [ ]* 1.4 Write property test: exactly 4 unique options with distractors in valid range (Property 2)
    - **Property 2: Generated questions have exactly 4 unique options with distractors in valid range**
    - **Validates: Requirements 2.2, 2.3, 2.6**

  - [ ]* 1.5 Write property test: batch generation produces correct count (Property 3)
    - **Property 3: Batch generation produces the correct number of questions**
    - **Validates: Requirements 2.4**

- [x] 2. Implement placement and reward logic
  - [x] 2.1 Implement placement and sticker calculation functions
    - In `features/math/math-race.ts`, implement `calculatePlacement(accuracyPercent)`: returns 1 if ≥75, 2 if ≥50, 3 otherwise
    - Implement `calculateStickerReward(placement)`: returns 3, 1, or 0 based on placement
    - Implement `getPlayerIncrement(questionsTotal)`: returns `100 / questionsTotal`
    - _Requirements: 5.2, 5.3, 5.4, 5.6, 6.1, 6.2, 6.3, 3.1_

  - [ ]* 2.2 Write property test: placement calculation maps accuracy to correct tier (Property 4)
    - **Property 4: Placement calculation maps accuracy to correct tier**
    - **Validates: Requirements 5.2, 5.3, 5.4**

  - [ ]* 2.3 Write property test: sticker reward matches placement (Property 5)
    - **Property 5: Sticker reward matches placement**
    - **Validates: Requirements 5.6, 6.1, 6.2, 6.3**

- [x] 3. Implement opponent simulation and position logic
  - [x] 3.1 Implement opponent position calculation
    - In `features/math/math-race.ts`, implement `calculateOpponentPositions(playerAccuracy, questionsTotal)`: returns opponent1 and opponent2 final positions satisfying placement tier constraints
    - Ensure opponents finish below player for 1st place (≥75%), one above and one below for 2nd (50–74%), both above for 3rd (<50%)
    - Cap opponent positions at 95% before final question, allow up to 100% on final
    - _Requirements: 3.5, 3.6, 3.8_

  - [ ]* 3.2 Write property test: opponent final positions satisfy placement tier constraints (Property 7)
    - **Property 7: Opponent final positions satisfy placement tier constraints**
    - **Validates: Requirements 3.5**

  - [ ]* 3.3 Write property test: position bounds invariant (Property 8)
    - **Property 8: Position bounds invariant**
    - **Validates: Requirements 3.6, 3.8**

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement useRaceSession hook
  - [x] 5.1 Create the useRaceSession hook
    - Create `hooks/useRaceSession.ts`
    - Manage `RaceState` with phases: `character-select`, `racing`, `results`
    - Implement `selectCharacter`, `startRace` (generates questions, transitions to racing phase), `submitAnswer` (tracks first-attempt per question, updates player position on correct, advances opponents), `advanceToNextQuestion`, `reset`
    - Compute `accuracyPercent` from `firstAttemptResults`
    - On final question answered: calculate placement, sticker reward, transition to results phase
    - On unmount during racing phase: discard session without persisting
    - _Requirements: 4.3, 5.1, 5.7, 3.1, 3.3, 9.1, 9.4_

  - [ ]* 5.2 Write property test: player position advances correctly (Property 6)
    - **Property 6: Player position advances on correct answer and is unchanged on incorrect answer**
    - **Validates: Requirements 3.1, 3.3**

  - [ ]* 5.3 Write property test: accuracy calculation (Property 9)
    - **Property 9: Accuracy calculation equals first-attempt correct count divided by total**
    - **Validates: Requirements 4.3, 5.1, 5.7**

- [x] 6. Implement CharacterSelector component
  - [x] 6.1 Create the CharacterSelector component
    - Create `components/activity/CharacterSelector.tsx`
    - Render 3 tappable character cards with emoji, label, and aria-label (min 48×48px touch target)
    - Highlight selected character with scale/border effect; deselect previous on new tap
    - Disable "Start Race" button until a character is selected
    - Announce selected character via aria-live region
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.6, 11.6_

- [x] 7. Implement RaceTrack component
  - [x] 7.1 Create the RaceTrack component
    - Create `components/activity/RaceTrack.tsx`
    - Render horizontal 3-lane track with swimming theme (blue gradient)
    - Position characters via CSS `translateX` percentage
    - Show start line (0%) and finish line (100%)
    - Distinguish player character with unique color/accessory
    - Animate movement with CSS transitions (200–500ms), respecting `prefers-reduced-motion`
    - Include aria-live region announcing player position updates
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 3.2, 3.4, 3.6, 11.4_

- [x] 8. Implement RaceResults component
  - [x] 8.1 Create the RaceResults component
    - Create `components/activity/RaceResults.tsx`
    - Display podium with 3 characters (1st center-top, 2nd left-lower, 3rd right-lowest)
    - Show placement, accuracy percentage (rounded), and stickers earned
    - Display congratulatory message (1st) or supportive message (2nd/3rd) from predefined sets (at least 2 each)
    - Render "Race Again" and "Back to Math" buttons
    - Include aria-live="polite" region announcing placement and accuracy
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

- [x] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Wire up the Activity Page
  - [x] 10.1 Create the Math Race activity page
    - Create `app/math/math-race/page.tsx`
    - Orchestrate screen flow: CharacterSelection → Race → Results
    - Wire `useRaceSession` hook for state management
    - Wire `useSpeech` to read questions aloud on display (cancel previous utterance first)
    - Wire `useCelebration` and `useAudio` for correct/incorrect feedback
    - Display CelebrationOverlay for 2500ms on correct answer, then auto-advance
    - On incorrect: shake animation (≤400ms), mark option incorrect, allow retry (no limit)
    - Show "Question X of Y" indicator during race
    - Show back button on character select only; hide during race
    - Transition from character select to race within 500ms/1 second
    - Handle audio/speech failures gracefully (visual feedback always displays)
    - _Requirements: 4.1, 4.2, 4.4, 4.5, 4.6, 9.1, 9.2, 9.3, 9.6, 11.1, 11.2, 11.3, 11.5, 1.4_

  - [x] 10.2 Implement sticker awarding and session completion
    - On results phase: award stickers via `useSticker` hook (invoke once per sticker)
    - Animate sticker display sequentially (800–1500ms per sticker)
    - Persist stickers before showing results; retry up to 2 times on failure
    - Call `recordActivityCompletion` with activityType `'math-race'`, correct count, and total questions via `useProgress` hook
    - Discard incomplete sessions on unmount without recording
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 10.4, 10.5, 9.4_

  - [x] 10.3 Add Math Race NavigationCard to the math hub
    - Add a `NavigationCard` to `app/math/page.tsx` with label "Math Race", icon "🏎️", color "bg-card-math", href "/math/math-race"
    - _Requirements: 10.1, 10.2_

- [x] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design's "Correctness Properties" section
- Unit tests validate specific examples and edge cases
- The project uses Next.js App Router, TypeScript, Tailwind CSS, and `fast-check` for property-based testing
- Existing hooks (`useProgress`, `useSticker`, `useSpeech`, `useCelebration`, `useAudio`) and components (`ActivityShell`, `CelebrationOverlay`, `AnswerOption`) should be reused where applicable
- The `useRaceSession` hook is separate from `useActivitySession` due to race-specific state needs (opponents, placement, first-attempt tracking)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "2.1"] },
    { "id": 2, "tasks": ["1.3", "1.4", "1.5", "2.2", "2.3", "3.1"] },
    { "id": 3, "tasks": ["3.2", "3.3", "5.1"] },
    { "id": 4, "tasks": ["5.2", "5.3", "6.1", "7.1", "8.1"] },
    { "id": 5, "tasks": ["10.1"] },
    { "id": 6, "tasks": ["10.2", "10.3"] }
  ]
}
```
