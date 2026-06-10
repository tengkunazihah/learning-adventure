# Tasks

## Task 1: Project Setup and Configuration

- [x] 1.1 Initialize Next.js 15 project with App Router, TypeScript, and Tailwind CSS
- [x] 1.2 Configure Tailwind theme with kid-friendly colors, touch-target sizes, and font sizes
- [x] 1.3 Create project folder structure (app/, components/, features/, hooks/, lib/, types/)
- [x] 1.4 Set up PWA manifest (public/manifest.json) with app name, icons, standalone display, and landscape orientation
- [x] 1.5 Configure service worker for offline asset caching
- [x] 1.6 Set up Vitest and React Testing Library for testing
- [x] 1.7 Install fast-check for property-based testing

## Task 2: Core Type Definitions and Utilities

- [x] 2.1 Create types/activity.ts with Question, AnswerOption, ActivityType, and ActivitySession interfaces
- [x] 2.2 Create types/progress.ts with ProgressData and ActivityRecord interfaces
- [x] 2.3 Create types/sticker.ts with Sticker and StickerCategory types
- [x] 2.4 Create types/speech.ts with SpeechConfig interface
- [x] 2.5 Create lib/constants.ts with app-wide constants (encouragement messages, sticker categories, shapes list, word list)
- [x] 2.6 Create lib/random.ts with randomization utilities (shuffle, randomInt, randomPick)
- [x] 2.7 Write property test: randomInt always produces values within specified range [PBT]

## Task 3: Storage Layer

- [x] 3.1 Create lib/storage.ts with StorageAdapter interface (save, load, clear, isAvailable)
- [x] 3.2 Implement LocalStorage adapter with JSON serialization and error handling
- [x] 3.3 Implement in-memory fallback adapter for when LocalStorage is unavailable
- [x] 3.4 Write property test: round-trip persistence (save then load produces equivalent data) [PBT]
- [x] 3.5 Write edge-case test: graceful fallback when LocalStorage is unavailable

## Task 4: Speech Synthesis Module

- [x] 4.1 Create lib/speech.ts with speak function, isSpeechSupported check, and SpeechConfig defaults
- [x] 4.2 Create hooks/useSpeech.ts hook wrapping speech synthesis with child-friendly rate/pitch
- [x] 4.3 Create hooks/useAudio.ts hook for playing sound effects (celebration, encouragement)
- [x] 4.4 Write test: speech fallback returns gracefully when synthesis is unavailable

## Task 5: UI Foundation Components

- [x] 5.1 Create components/ui/TouchButton.tsx with minimum 80x80px dimensions and touch-friendly styling
- [x] 5.2 Create components/ui/NavigationCard.tsx with icon, label, color, and navigation action
- [x] 5.3 Create components/ui/AnswerOption.tsx for activity answer choices with visual feedback
- [x] 5.4 Create components/ui/ProgressBar.tsx for visual progress indication
- [x] 5.5 Create components/ui/BackButton.tsx for navigating back to parent views
- [x] 5.6 Write test: TouchButton renders with minimum 80x80px dimensions

## Task 6: Activity Shell and Session Management

- [x] 6.1 Create hooks/useActivitySession.ts managing question flow, current index, and completion state
- [x] 6.2 Create components/activity/ActivityShell.tsx as shared layout wrapper for all activities
- [x] 6.3 Create components/activity/QuestionDisplay.tsx for rendering question text and images
- [x] 6.4 Create components/activity/CompletionScreen.tsx showing earned sticker and navigation options
- [x] 6.5 Create hooks/useCelebration.ts for triggering celebration effects on correct answers
- [x] 6.6 Create components/activity/CelebrationOverlay.tsx with stars animation and encouraging message
- [x] 6.7 Write property test: score never decreases regardless of answer sequence [PBT]
- [x] 6.8 Write property test: encouraging message is always from the valid set [PBT]

## Task 7: Home Screen

- [x] 7.1 Create app/page.tsx with four NavigationCard components (Math, English, Sticker Book, Parent Dashboard)
- [x] 7.2 Style home screen with grid layout optimized for iPad landscape
- [x] 7.3 Add distinct colorful illustrations and labels to each navigation card
- [x] 7.4 Write test: home screen renders exactly four navigation cards

## Task 8: Math Module - Count the Animals

- [x] 8.1 Create features/math/count-animals.ts with question generation logic (random count 1-10, random animal, 4 unique options)
- [x] 8.2 Create app/math/count-animals/page.tsx activity page using ActivityShell and useActivitySession
- [x] 8.3 Add animal illustrations and answer option rendering
- [x] 8.4 Integrate speech synthesis to read "How many animals do you see?"
- [x] 8.5 Connect celebration effect on correct answer and encouragement on incorrect
- [x] 8.6 Write property test: generated count is always between 1 and 10 inclusive [PBT]
- [x] 8.7 Write property test: exactly 4 unique answer options with correct answer included [PBT]

## Task 9: Math Module - Number Matching

- [x] 9.1 Create features/math/number-matching.ts with question generation logic (target number, multiple object groups)
- [x] 9.2 Create app/math/number-matching/page.tsx activity page
- [x] 9.3 Render target number prominently and object groups as selectable options
- [x] 9.4 Integrate speech synthesis to pronounce the target number
- [x] 9.5 Connect celebration and encouragement feedback
- [x] 9.6 Write property test: target number always between 1 and 10, all groups have distinct quantities [PBT]

## Task 10: Math Module - Shape Hunt

- [x] 10.1 Create features/math/shape-hunt.ts with question generation for 5 shapes (Circle, Square, Triangle, Rectangle, Star)
- [x] 10.2 Create app/math/shape-hunt/page.tsx activity page
- [x] 10.3 Render shape visuals (SVG) and prompt text
- [x] 10.4 Integrate speech synthesis to read "Tap the [shape]"
- [x] 10.5 Connect celebration and encouragement feedback
- [x] 10.6 Write property test: displayed shapes always include the target shape [PBT]

## Task 11: English Module - Letter Recognition

- [x] 11.1 Create features/english/letter-recognition.ts with question generation (target uppercase letter, multiple choices)
- [x] 11.2 Create app/english/letter-recognition/page.tsx activity page
- [x] 11.3 Render target letter prominently and letter choices as TouchButtons
- [x] 11.4 Integrate speech synthesis to pronounce the target letter
- [x] 11.5 Connect celebration and encouragement feedback
- [x] 11.6 Write property test: target letter is always valid uppercase A-Z [PBT]
- [x] 11.7 Write property test: options contain exactly one correct answer with all distinct values [PBT]

## Task 12: English Module - Beginning Sounds

- [x] 12.1 Create features/english/beginning-sounds.ts with question generation (letter-picture pairs, multiple picture options)
- [x] 12.2 Create app/english/beginning-sounds/page.tsx activity page
- [x] 12.3 Render target letter and picture options with images
- [x] 12.4 Integrate speech synthesis to read "Which picture starts with [letter]?"
- [x] 12.5 Connect celebration and encouragement feedback
- [x] 12.6 Write property test: options always include the correct picture matching the target letter [PBT]

## Task 13: English Module - First Words

- [x] 13.1 Create features/english/first-words.ts with word data (Cat, Dog, Ball, Car, Apple, Fish, Tree, Bird, Book, Sun) including images and animations
- [x] 13.2 Create app/english/first-words/page.tsx activity page
- [x] 13.3 Render word, image, and simple animation for each word
- [x] 13.4 Integrate speech synthesis to pronounce word on display and on tap
- [x] 13.5 Write test: all 10 words are included in the word data set

## Task 14: Math and English Module Hub Pages

- [x] 14.1 Create app/math/page.tsx hub with cards for Count Animals, Number Matching, and Shape Hunt
- [x] 14.2 Create app/english/page.tsx hub with cards for Letter Recognition, Beginning Sounds, and First Words
- [x] 14.3 Style hub pages with kid-friendly layout and navigation back to home

## Task 15: Sticker Reward System

- [x] 15.1 Create features/rewards/sticker-data.ts with sticker definitions for 5 categories (Animals, Stars, Dinosaurs, Vehicles, Fruits)
- [x] 15.2 Create features/rewards/sticker-engine.ts with logic to award random sticker on activity completion
- [x] 15.3 Create components/rewards/StickerCard.tsx for individual sticker display
- [x] 15.4 Create components/rewards/StickerGrid.tsx for scrapbook grid layout
- [x] 15.5 Create app/sticker-book/page.tsx displaying collected stickers
- [x] 15.6 Integrate sticker award into activity completion flow
- [x] 15.7 Write property test: exactly one sticker awarded per activity completion [PBT]

## Task 16: Progress Management

- [x] 16.1 Create hooks/useProgress.ts with React Context for progress state (activities completed, letters, numbers, stickers, last played)
- [x] 16.2 Integrate progress tracking into useActivitySession (update on completion)
- [x] 16.3 Save progress to Local Storage on every state change
- [x] 16.4 Restore progress from Local Storage on app initialization
- [x] 16.5 Write property test: progress data round-trip (save and restore produces equivalent data) [PBT]

## Task 17: Parent Dashboard

- [x] 17.1 Create features/parent-dashboard/stats-calculator.ts for computing display metrics from progress data
- [x] 17.2 Create components/dashboard/StatCard.tsx for individual metric display
- [x] 17.3 Create components/dashboard/ProgressChart.tsx for chart/progress bar visualization
- [x] 17.4 Create app/parent-dashboard/page.tsx with all stats: activities completed, letters learned, numbers mastered, stickers collected, last played
- [x] 17.5 Write test: dashboard correctly computes and displays all progress metrics

## Task 18: Responsive Layout and Accessibility

- [x] 18.1 Configure root layout (app/layout.tsx) with meta viewport, fonts, and PWA head tags
- [x] 18.2 Apply iPad landscape-first responsive styles across all pages
- [x] 18.3 Verify all touch targets meet minimum 80x80px across all interactive components
- [x] 18.4 Verify font sizes meet minimum 18px body text requirement
- [x] 18.5 Verify color contrast meets WCAG AA for large text across theme colors
- [x] 18.6 Add aria labels and roles to interactive elements for accessibility

## Task 19: Integration and Polish

- [x] 19.1 Integrate speech synthesis fallback (visual-only mode when unavailable)
- [x] 19.2 Add session question randomization to all activities
- [x] 19.3 Add loading states and transitions between pages
- [x] 19.4 Test offline functionality with service worker caching
- [x] 19.5 End-to-end test: complete an activity flow from home → activity → celebration → sticker → home
- [x] 19.6 Write property test: question order varies across multiple session generations [PBT]
