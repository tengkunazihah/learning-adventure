# Requirements Document

## Introduction

Math Race is a new math activity for the kids' learning app that combines arithmetic practice with an animated race theme. The child selects a character (duck, panda, or rabbit) and answers math questions. Each correct answer moves the chosen character forward in a race against the other two characters. At the end of the session, the child's placement is determined by their accuracy percentage: 75% or above earns 1st place, 50%–74% earns 2nd place, and below 50% earns 3rd place. Sticker rewards are granted based on placement: 3 stickers for 1st, 1 sticker for 2nd, and none for 3rd.

## Glossary

- **Math_Race_Engine**: The module responsible for generating math questions, managing race state, calculating placement, and determining sticker rewards for the Math Race activity.
- **Race_Display**: The UI component that renders the race track or swimming lane, showing the three characters and their relative positions.
- **Character_Selector**: The UI component that presents the three selectable characters (duck, panda, rabbit) before the race begins.
- **Race_Character**: One of the three animated characters (duck, panda, or rabbit) that participate in the race.
- **Player_Character**: The Race_Character selected by the child to represent them in the race.
- **Opponent_Character**: A Race_Character not selected by the child, controlled by the game engine during the race.
- **Race_Track**: The visual lane or course along which Race_Characters move from start to finish.
- **Activity_Page**: The Next.js page component that orchestrates the Math Race activity session, including character selection, question flow, and race animation.
- **Placement**: The finishing position (1st, 2nd, or 3rd) assigned to the Player_Character at the end of the session based on accuracy percentage.

## Requirements

### Requirement 1: Character Selection

**User Story:** As a child, I want to choose my favorite character before the race starts, so that I feel connected to my racer and excited to play.

#### Acceptance Criteria

1. WHEN the Math Race activity is launched, THE Character_Selector SHALL display exactly 3 selectable Race_Characters: duck (🦆), panda (🐼), and rabbit (🐰), with no character pre-selected and the "Start Race" button disabled.
2. THE Character_Selector SHALL display each Race_Character as a tappable card with a minimum touch target size of 48x48 CSS pixels, containing the character's emoji, a text label naming the character (maximum 10 characters), and an aria-label identifying the character for screen readers.
3. WHEN the child taps a Race_Character, THE Character_Selector SHALL visually highlight the selected character with a border or scale effect, remove any highlight from the previously selected character, and enable the "Start Race" button.
4. WHEN the child taps the "Start Race" button, THE Activity_Page SHALL transition from the character selection screen to the race screen within 500 milliseconds, with the selected character designated as the Player_Character.
5. IF the child has not selected a Race_Character, THEN THE Character_Selector SHALL keep the "Start Race" button disabled and visually styled as non-interactive.
6. THE Character_Selector SHALL allow only one Race_Character to be selected at a time, so that tapping a different character deselects the current selection and selects the newly tapped character.

### Requirement 2: Math Question Generation

**User Story:** As a child, I want to answer different math questions during the race, so that I can practice my arithmetic skills.

#### Acceptance Criteria

1. THE Math_Race_Engine SHALL generate addition and subtraction problems where each operand is between 1 and 10 inclusive and the result is between 0 and 20 inclusive.
2. THE Math_Race_Engine SHALL generate exactly 4 answer options per question: 1 correct answer and 3 unique distractors.
3. THE Math_Race_Engine SHALL generate distractor values as integers within ±3 of the correct answer, clamped to a minimum of 0 and a maximum of 20, ensuring all 4 options are distinct.
4. THE Math_Race_Engine SHALL produce a batch of QUESTIONS_PER_SESSION questions per race session.
5. THE Math_Race_Engine SHALL randomly select the operation type (addition or subtraction) for each generated question.
6. IF the ±3 range around the correct answer contains fewer than 3 candidate integers (after excluding the correct answer and clamping to 0–20), THEN THE Math_Race_Engine SHALL expand the range by 1 in each direction until 3 distinct distractor values are available.

### Requirement 3: Race Progression

**User Story:** As a child, I want to see my character move forward when I answer correctly, so that I feel rewarded and motivated to keep going.

#### Acceptance Criteria

1. WHEN the child selects the correct answer, THE Race_Display SHALL advance the Player_Character forward by one position increment equal to 100% divided by QUESTIONS_PER_SESSION (i.e., 20% per correct answer).
2. WHEN the child selects the correct answer, THE Race_Display SHALL animate the Player_Character's forward movement over a duration between 300 and 600 milliseconds.
3. WHEN the child selects an incorrect answer, THE Race_Display SHALL keep the Player_Character at the current position without any backward movement.
4. THE Race_Display SHALL show all 3 Race_Characters on the Race_Track simultaneously, with the Player_Character distinguished from Opponent_Characters by a unique color or accessory that does not appear on any Opponent_Character.
5. WHEN the child answers a question (correct or incorrect), THE Race_Display SHALL advance each Opponent_Character by a randomized increment between 5% and 30% of the Race_Track length, such that at session end: IF the child's accuracy is 75% or above (Placement tier 1st), THEN both Opponent_Characters finish with final positions below the Player_Character's final position; IF the child's accuracy is between 50% and 74% inclusive (Placement tier 2nd), THEN exactly one Opponent_Character finishes with a final position above the Player_Character's final position and one finishes below; IF the child's accuracy is below 50% (Placement tier 3rd), THEN both Opponent_Characters finish with final positions above the Player_Character's final position.
6. THE Race_Display SHALL display position progress for all 3 characters as a percentage of the total Race_Track length, starting at 0% and capping at 100%.
7. WHEN the final question of the session is answered, THE Race_Display SHALL animate all Race_Characters to their final positions before displaying the session results.
8. IF an Opponent_Character's cumulative position would exceed 100% before the final question is answered, THEN THE Race_Display SHALL cap that Opponent_Character's displayed position at 95% until the final question, at which point it advances to its calculated final position (capped at 100%).

### Requirement 4: Answer Handling and Feedback

**User Story:** As a child, I want immediate feedback on my answers so that I can learn and stay engaged in the race.

#### Acceptance Criteria

1. WHEN the child selects the correct answer, THE Activity_Page SHALL disable all answer options, display the CelebrationOverlay animation with an encouragement message for 2500 milliseconds, play a celebration sound, and then automatically advance to the next question.
2. WHEN the child selects an incorrect answer, THE Activity_Page SHALL play an encouragement sound, apply an incorrect visual state (distinct background color and a brief shake animation lasting no more than 400 milliseconds) to the selected option, disable that option, and allow the child to select a different remaining option with no limit on retry attempts.
3. THE Activity_Page SHALL track first-attempt accuracy per question: a question is marked accurate only if the child's first selected option is the correct answer; if the first selected option is incorrect, that question is marked inaccurate regardless of eventual correct selection. The accuracy percentage SHALL equal the count of accurate questions divided by the total questions in the session, multiplied by 100.
4. THE Activity_Page SHALL display the current question number relative to the total in the format "Question [current] of [total]" (e.g., "Question 3 of 5") throughout the race, updating each time the session advances to the next question.
5. IF audio playback is unavailable or fails, THEN THE Activity_Page SHALL still display all visual feedback (CelebrationOverlay animation, incorrect option marking, and encouragement message) without interruption or delay.
6. WHEN the child selects an incorrect answer, THE Activity_Page SHALL mark only the selected option as incorrect without revealing the correct answer and without changing the visual state of any unselected options.

### Requirement 5: Placement Calculation

**User Story:** As a child, I want to see how I placed in the race based on how well I did, so that I understand the connection between effort and results.

#### Acceptance Criteria

1. WHEN the race session ends, THE Math_Race_Engine SHALL calculate the accuracy percentage as the number of first-attempt correct answers divided by the total number of questions (QUESTIONS_PER_SESSION), multiplied by 100, where a first-attempt correct answer is defined as selecting the correct option on the first selection for a given question with no prior incorrect selection on that same question.
2. IF the accuracy percentage is 75 or above, THEN THE Math_Race_Engine SHALL assign 1st place Placement to the Player_Character.
3. IF the accuracy percentage is 50 or above and below 75, THEN THE Math_Race_Engine SHALL assign 2nd place Placement to the Player_Character.
4. IF the accuracy percentage is below 50, THEN THE Math_Race_Engine SHALL assign 3rd place Placement to the Player_Character.
5. WHEN the race ends, THE Race_Display SHALL animate 3 race characters (the Player_Character and 2 opponent characters) reaching their final lane positions over a duration of 2000 milliseconds, with the Player_Character finishing in the lane position (1st, 2nd, or 3rd) corresponding to the assigned Placement.
6. WHEN the Placement is 1st place, THE Math_Race_Engine SHALL award 3 stickers; WHEN the Placement is 2nd place, THE Math_Race_Engine SHALL award 1 sticker; WHEN the Placement is 3rd place, THE Math_Race_Engine SHALL award 0 stickers.
7. THE Math_Race_Engine SHALL track first-attempt status per question by recording whether any incorrect option was selected before the correct option for that question during the session.

### Requirement 6: Sticker Rewards

**User Story:** As a child, I want to earn stickers based on my race placement, so that I have an incentive to answer questions correctly.

#### Acceptance Criteria

1. WHEN the Player_Character receives 1st place Placement, THE Math_Race_Engine SHALL award exactly 3 distinct stickers by invoking the sticker award logic once per sticker.
2. WHEN the Player_Character receives 2nd place Placement, THE Math_Race_Engine SHALL award exactly 1 sticker by invoking the sticker award logic once.
3. WHEN the Player_Character receives 3rd place Placement, THE Math_Race_Engine SHALL award 0 stickers and THE Activity_Page SHALL proceed directly to the final results screen.
4. WHEN stickers are awarded, THE Activity_Page SHALL display each awarded sticker sequentially, one at a time, with an animation lasting between 800 milliseconds and 1500 milliseconds per sticker, before transitioning to the final results screen within 500 milliseconds after the last sticker animation completes.
5. WHEN stickers are awarded, THE Activity_Page SHALL persist each sticker to the child's collection using the existing sticker and progress systems, ensuring all awarded stickers are saved before displaying the final results screen.
6. IF persistence of any awarded sticker fails, THEN THE Activity_Page SHALL retry persistence up to 2 additional attempts and still display the sticker animation to the child regardless of persistence outcome.

### Requirement 7: Results Screen

**User Story:** As a child, I want to see my final race results with my character on the podium, so that I feel a sense of achievement.

#### Acceptance Criteria

1. WHEN the sticker award animation completes (or immediately if 0 stickers are awarded), THE Activity_Page SHALL display a results screen showing the Player_Character's Placement (1st, 2nd, or 3rd), the accuracy percentage rounded to the nearest whole number followed by a "%" symbol, and the number of stickers earned as a digit.
2. WHEN the results screen is displayed, THE Activity_Page SHALL display all 3 Race_Characters on a podium arrangement where the 1st-place character is in the center-top position, the 2nd-place character is on the left at a lower position, and the 3rd-place character is on the right at the lowest position.
3. WHEN 1st place is achieved, THE Activity_Page SHALL display a congratulatory message from a predefined set of at least 2 encouraging messages that acknowledge the win.
4. WHEN 2nd or 3rd place is achieved, THE Activity_Page SHALL display a supportive message from a predefined set of at least 2 messages that encourage the child to try again.
5. THE Activity_Page SHALL provide a "Race Again" button that discards the completed session state, generates a new set of questions, and navigates to the Character_Selector screen.
6. THE Activity_Page SHALL provide a "Back to Math" button that navigates to the math hub at route /math.
7. WHEN the results screen is displayed, THE Activity_Page SHALL include an aria-live="polite" region that announces the Player_Character's Placement and accuracy percentage.

### Requirement 8: Race Animation and Theme

**User Story:** As a child, I want the race to feel exciting with animated characters racing, so that the activity is fun and engaging.

#### Acceptance Criteria

1. THE Race_Display SHALL render a horizontal Race_Track with 3 lanes arranged vertically (top to bottom), one for each Race_Character, where each lane is visually distinguished by a unique background color or pattern that differs from adjacent lanes by at least a clearly perceptible contrast.
2. THE Race_Display SHALL render each Race_Character as an emoji (🦆 for duck, 🐼 for panda, 🐰 for rabbit) sized at a minimum of 48x48 CSS pixels with a tap-target area of at least 48x48 CSS pixels.
3. THE Race_Display SHALL display a start line at the left edge (0% horizontal position) and a finish line at the right edge (100% horizontal position) of the Race_Track, each visually distinct from the lane backgrounds.
4. WHEN the race begins, THE Race_Display SHALL position all Race_Characters at the start line (0% horizontal progress).
5. WHILE the race is in progress, THE Race_Display SHALL show a swimming theme for the Race_Track using a blue background gradient or wave-pattern visual elements applied to each lane.
6. WHEN a Race_Character's progress percentage changes, THE Race_Display SHALL animate that character's horizontal position from its previous position to the new position using CSS transitions or animations with a duration between 200ms and 500ms.
7. IF the user's system has prefers-reduced-motion enabled, THEN THE Race_Display SHALL move characters to their new positions without animated transitions.
8. WHEN a Race_Character reaches 100% progress, THE Race_Display SHALL position that character at the finish line.

### Requirement 9: Session Flow and Navigation

**User Story:** As a child, I want clear navigation so that I can start, play, and finish the race without confusion.

#### Acceptance Criteria

1. THE Activity_Page SHALL follow the screen sequence: Character Selection → Race (questions + track) → Results, advancing automatically from Race to Results when the final question is answered.
2. THE Activity_Page SHALL provide a back button on the character selection screen that navigates to the math hub at route /math.
3. WHILE the race is in progress (from the first question displayed until the final question is answered), THE Activity_Page SHALL hide the back button to prevent accidental navigation away from an active session.
4. IF the child navigates away from the Activity_Page before the race session is complete (via browser back, route change, or closing the page), THEN THE Activity_Page SHALL discard the incomplete session without recording progress or awarding stickers.
5. WHEN the race session is complete and the Results screen is displayed, THE Activity_Page SHALL show a button to return to the math hub at route /math and a button to replay the race activity.
6. WHEN the child selects a character on the Character Selection screen, THE Activity_Page SHALL transition to the Race screen within 1 second and display the first question.

### Requirement 10: Integration with Existing App

**User Story:** As a child, I want to find Math Race alongside other math activities, so that I can easily choose to play it.

#### Acceptance Criteria

1. THE Activity_Page SHALL be accessible at the route /math/math-race.
2. THE Activity_Page SHALL appear as a NavigationCard on the math hub page with the label "Math Race", the icon "🏎️", a color prop value of "bg-card-math", and an href of "/math/math-race".
3. THE Math_Race_Engine SHALL register "math-race" as a valid ActivityType in the ActivityType union type defined in the type system.
4. WHEN the race session ends, THE Activity_Page SHALL call awardNewSticker via the useSticker hook to award a sticker, and then call recordActivityCompletion with the activityType "math-race", the number of correct answers in the session, and the total number of questions in the session.
5. THE Activity_Page SHALL consume the useProgress hook for progress persistence and the useSticker hook for sticker awarding, following the same pattern used by existing activity pages (e.g., count-animals).
6. WHEN a child navigates to /math/math-race, THE Activity_Page SHALL render within 3 seconds and display the initial race session state before any user interaction is required.

### Requirement 11: Speech and Accessibility

**User Story:** As a child who may not read well yet, I want the questions read aloud, so that I can play the race even if I cannot read the numbers.

#### Acceptance Criteria

1. WHEN a new question is displayed during the race, THE Activity_Page SHALL use speech synthesis to read the question aloud in the format "What is [number] plus [number]?" or "What is [number] minus [number]?" within 500 milliseconds of the question appearing.
2. WHEN a new question is displayed before the previous speech utterance has completed, THE Activity_Page SHALL cancel the previous utterance before speaking the new question.
3. THE Activity_Page SHALL include aria-labels that describe the purpose of each interactive element, including character selection buttons (e.g., "Select [character name]"), answer option buttons (e.g., "Answer: [value]"), and navigation buttons (e.g., "Go back to [destination]").
4. WHEN the Player_Character's position changes after a question is answered, THE Race_Display SHALL announce the updated position via an aria-live="polite" region in the format "Your [character name] is in [ordinal] place" within 1000 milliseconds.
5. IF speech synthesis is not supported by the browser, THEN THE Activity_Page SHALL display all question text visually, allow the child to select answers, and complete the race without error.
6. WHEN a character is tapped in the Character_Selector, THE Character_Selector SHALL announce the selected character name via an aria-live region within 500 milliseconds of the tap.
