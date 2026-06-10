# Implementation Plan: Visual Math Problems

## Overview

Implement the Visual Math Problems activity — a new math module that teaches addition and subtraction using visual emoji object representations. Children see groups of objects and select the correct numerical answer from multiple choices. The implementation reuses existing infrastructure (ActivityShell, useActivitySession, CelebrationOverlay, CompletionScreen) and adds a new question generation engine, a visual display component, and the activity page.

## Tasks

- [x] 1. Set up types, constants, and project structure
  - [x] 1.1 Extend ActivityType union and add constants
    - Add `'visual-math-problems'` to the `ActivityType` union in `types/activity.ts`
    - Add `MATH_OBJECT_TYPES` array and `MATH_OBJECT_EMOJI_MAP` record to `lib/constants.ts`
    - _Requirements: 8.3, 1.5_

- [x] 2. Implement the Visual Math Engine
  - [x] 2.1 Create the question generation module
    - Create `features/math/visual-math-problems.ts`
    - Implement `generateMathProblem()` with addition constraints (operands 1–9, sum ≤ 10) and subtraction constraints (minuend 2–10, subtrahend 1 to minuend−1, difference ≥ 1)
    - Implement `generateDistractors()` producing 3 unique integers within ±3 of correct answer, clamped [0,10], expanding range if fewer than 3 candidates available
    - Implement `generateVisualMathQuestion()` that assembles a `Question` with encoded ID format `visual-math-{operator}-{op1}-{op2}-{objectType}-{timestamp}-{random}`
    - Implement `generateVisualMathQuestions()` returning exactly `QUESTIONS_PER_SESSION + 5` questions with ~50/50 operator split and no consecutive duplicate (operand1, operand2, operator) triples
    - Implement `parseMathQuestionId()` to extract operator, operands, and objectType from the question ID
    - Speech text format: addition → "What is {op1} plus {op2}?", subtraction → "What is {op1} minus {op2}?"
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 6.2, 6.3_

  - [ ]* 2.2 Write property test: Arithmetic constraints (Property 1)
    - **Property 1: Arithmetic constraints hold for all generated problems**
    - **Validates: Requirements 1.1, 1.2**

  - [ ]* 2.3 Write property test: Operator distribution (Property 2)
    - **Property 2: Operator distribution is approximately balanced**
    - **Validates: Requirements 1.3**

  - [ ]* 2.4 Write property test: Batch size (Property 3)
    - **Property 3: Batch size is exactly QUESTIONS_PER_SESSION + 5**
    - **Validates: Requirements 1.4**

  - [ ]* 2.5 Write property test: Valid object type (Property 4)
    - **Property 4: Object type is always from the valid set**
    - **Validates: Requirements 1.5**

  - [ ]* 2.6 Write property test: No consecutive duplicates (Property 5)
    - **Property 5: No consecutive duplicate problems**
    - **Validates: Requirements 1.6**

  - [ ]* 2.7 Write property test: Answer options well-formed (Property 7)
    - **Property 7: Answer options are well-formed**
    - **Validates: Requirements 4.1, 4.2, 4.3**

  - [ ]* 2.8 Write property test: Distractors in range (Property 8)
    - **Property 8: Distractors are within valid range**
    - **Validates: Requirements 4.4, 4.6**

  - [ ]* 2.9 Write property test: Correct answer position varies (Property 9)
    - **Property 9: Correct answer position varies across consecutive questions**
    - **Validates: Requirements 4.5**

  - [ ]* 2.10 Write property test: Speech text format (Property 11)
    - **Property 11: Speech text matches operation format**
    - **Validates: Requirements 6.2, 6.3**

  - [ ]* 2.11 Write unit tests for the Visual Math Engine
    - Create `features/math/visual-math-problems.test.ts`
    - Test specific addition/subtraction examples
    - Test boundary operands (sum = 10, difference = 1)
    - Test distractor expansion at range limits (correct answer = 0, 1, 9, 10)
    - Test `parseMathQuestionId` with valid and malformed IDs
    - _Requirements: 1.1, 1.2, 4.4, 4.6_

- [x] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement the VisualMathDisplay component
  - [x] 4.1 Create the VisualMathDisplay component
    - Create `components/activity/VisualMathDisplay.tsx`
    - Accept props: `operator`, `operand1`, `operand2`, `objectEmoji`
    - Addition rendering: left group of `operand1` emojis, centered plus symbol (+) with ≥16px separation, right group of `operand2` emojis
    - Subtraction rendering: single row of `operand1` emojis with rightmost `operand2` items crossed out (50% opacity + diagonal strike-through), minus (−) and equals (=) symbols below
    - Each emoji rendered at minimum 48×48px
    - Include `aria-label` with the full question text
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 4.2 Write property test: Subtraction display invariant (Property 6)
    - **Property 6: Subtraction display arithmetic invariant**
    - Create `components/activity/VisualMathDisplay.pbt.test.tsx`
    - **Validates: Requirements 3.1, 3.2, 3.5**

  - [ ]* 4.3 Write unit tests for VisualMathDisplay
    - Create `components/activity/VisualMathDisplay.test.tsx`
    - Test addition renders correct emoji counts in both groups
    - Test plus symbol present between groups
    - Test subtraction renders crossed-out styling (opacity + strike)
    - Test minus and equals symbols present
    - Test minimum 48×48px size via CSS classes
    - Test aria-label present with correct text
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 3.1, 3.3, 3.4_

- [x] 5. Implement the Activity Page
  - [x] 5.1 Create the Visual Math Problems page component
    - Create `app/math/visual-math-problems/page.tsx`
    - Use `useActivitySession('visual-math-problems', generateVisualMathQuestions)`
    - Use `useSpeech` with rate 0.8, pitch 1.1
    - Use `useCelebration` for correct answer feedback (2500ms celebration duration)
    - Use `useSticker` to award sticker on completion
    - Parse question ID with `parseMathQuestionId` to extract display parameters
    - Render `VisualMathDisplay` with extracted operator, operands, and emoji
    - Render answer options grid using `AnswerOption` component
    - Correct answer: show CelebrationOverlay, disable options, advance after delay
    - Incorrect answer: mark selected option incorrect, play encouragement, allow retry (no penalty)
    - Speak question on display (cancel in-progress speech first)
    - Provide repeat button (hidden if speech unsupported)
    - Show ProgressBar with current question / total
    - Back button navigates to `/math`
    - On completion: render CompletionScreen with sticker, call `recordActivityCompletion`
    - Include `aria-live="polite"` region for new question announcements
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.4, 6.5, 6.6, 6.7, 7.1, 7.2, 7.3, 7.4, 8.1, 8.4, 8.5_

  - [ ]* 5.2 Write unit tests for the Activity Page
    - Create `app/math/visual-math-problems/page.test.tsx`
    - Test speech synthesis called on question display
    - Test celebration overlay on correct answer
    - Test incorrect answer marking without revealing correct answer
    - Test progress bar shows correct values
    - Test back button href is `/math`
    - Test CompletionScreen renders on session complete
    - Test repeat button hidden when speech unsupported
    - Test recordActivityCompletion called on completion
    - _Requirements: 5.1, 5.2, 5.3, 6.1, 6.6, 7.1, 7.2, 7.3, 8.4_

- [ ] 6. Integrate with the Math Hub
  - [x] 6.1 Add NavigationCard to the math hub page
    - Add a `NavigationCard` to `app/math/page.tsx` with label ≤ 20 characters, an emoji icon, and href `/math/visual-math-problems`
    - _Requirements: 8.2_

  - [ ]* 6.2 Write integration tests
    - Verify math hub page includes NavigationCard for visual-math-problems
    - Verify `ActivityType` accepts 'visual-math-problems' (compile-time check)
    - _Requirements: 8.2, 8.3_

- [x] 7. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The implementation follows existing patterns from `count-animals` for consistency
- All property-based tests use `fast-check` with `{ numRuns: 200 }` per project convention

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4", "2.5", "2.6", "2.7", "2.8", "2.9", "2.10", "2.11"] },
    { "id": 3, "tasks": ["4.1"] },
    { "id": 4, "tasks": ["4.2", "4.3"] },
    { "id": 5, "tasks": ["5.1", "6.1"] },
    { "id": 6, "tasks": ["5.2", "6.2"] }
  ]
}
```
