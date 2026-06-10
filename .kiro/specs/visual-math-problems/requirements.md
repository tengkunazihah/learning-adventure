# Requirements Document

## Introduction

Visual Math Problems is a new math activity for the kids' learning app that teaches addition and subtraction using photos/images of familiar objects. Children solve problems by looking at visual representations — groups of objects for addition, and objects with some crossed out for subtraction — then selecting the correct numerical answer from multiple choices.

## Glossary

- **Visual_Math_Engine**: The module responsible for generating visual math problem questions, including operands, operators, object types, and answer options.
- **Problem_Display**: The UI component that renders the visual representation of a math problem, showing object images arranged to illustrate the operation.
- **Object_Image**: An emoji or image representing a countable object (e.g., apple, star, balloon) used in visual math problems.
- **Crossed_Out_Object**: An Object_Image rendered with a visual strike-through or "eaten" indicator to represent subtraction (removal) from a group.
- **Activity_Page**: The Next.js page component that orchestrates the visual math problems activity session.
- **Answer_Grid**: The UI area displaying multiple-choice numerical answer options for the child to select from.

## Requirements

### Requirement 1: Problem Generation

**User Story:** As a child, I want to see different math problems each time I play, so that I can practice a variety of addition and subtraction scenarios.

#### Acceptance Criteria

1. THE Visual_Math_Engine SHALL generate addition problems with two operands where each operand is between 1 and 9 inclusive and the sum does not exceed 10.
2. THE Visual_Math_Engine SHALL generate subtraction problems with two operands where the minuend is between 2 and 10 inclusive and the subtrahend is between 1 and the minuend minus 1 inclusive, ensuring the difference is always at least 1.
3. THE Visual_Math_Engine SHALL randomly select the operation type (addition or subtraction) for each generated problem with approximately equal probability (between 40% and 60% for each type over a batch).
4. THE Visual_Math_Engine SHALL produce a batch of exactly QUESTIONS_PER_SESSION + 5 questions per generation call.
5. WHEN generating a problem, THE Visual_Math_Engine SHALL randomly select an Object_Image type from a predefined set of at least 6 familiar objects (e.g., apple, star, balloon, flower, fish, heart).
6. THE Visual_Math_Engine SHALL ensure no two consecutive questions in a generated batch use the same combination of operands and operator.

### Requirement 2: Visual Representation of Addition

**User Story:** As a child, I want to see groups of objects that I can count together, so that I can understand what addition means visually.

#### Acceptance Criteria

1. WHEN an addition problem is displayed, THE Problem_Display SHALL render the first operand as a group of Object_Images on the left side, where the number of Object_Images equals the first operand value (between 1 and 9 inclusive).
2. WHEN an addition problem is displayed, THE Problem_Display SHALL render a plus symbol (+) between the two groups, visually centered and separated from each group by at least 16px of whitespace.
3. WHEN an addition problem is displayed, THE Problem_Display SHALL render the second operand as a group of Object_Images on the right side, where the number of Object_Images equals the second operand value (between 1 and 9 inclusive).
4. THE Problem_Display SHALL use the same Object_Image type for both groups within a single addition problem, selected from the defined set of countable item images (e.g., apple, star, balloon).
5. THE Problem_Display SHALL render each Object_Image at a minimum size of 48x48 CSS pixels so that individual items are distinguishable and countable by young children.

### Requirement 3: Visual Representation of Subtraction

**User Story:** As a child, I want to see objects with some crossed out, so that I can understand what subtraction means visually (taking away).

#### Acceptance Criteria

1. WHEN a subtraction problem is displayed, THE Problem_Display SHALL render a number of Object_Images equal to the minuend value (between 1 and 10 inclusive), arranged in a single horizontal row.
2. WHEN a subtraction problem is displayed, THE Problem_Display SHALL render the rightmost Object_Images in the row, equal in quantity to the subtrahend value, as Crossed_Out_Objects, so that the remaining uncrossed Object_Images on the left equal the difference.
3. WHEN a subtraction problem is displayed, THE Problem_Display SHALL render a minus symbol (−) and an equals symbol (=) positioned below the visual group of objects.
4. THE Problem_Display SHALL visually distinguish Crossed_Out_Objects from uncrossed objects by applying both a semi-transparent overlay (50% opacity) and a diagonal strike-through line across each Crossed_Out_Object.
5. WHEN a subtraction problem is displayed, THE Problem_Display SHALL ensure the number of uncrossed Object_Images equals the arithmetic difference between the minuend and subtrahend.

### Requirement 4: Answer Options

**User Story:** As a child, I want to see number choices to pick from, so that I can select my answer without needing to type.

#### Acceptance Criteria

1. THE Visual_Math_Engine SHALL generate exactly 4 answer options for each problem.
2. THE Visual_Math_Engine SHALL include the correct answer as one of the 4 options.
3. THE Visual_Math_Engine SHALL generate 3 distractor values that are distinct from the correct answer and from each other.
4. THE Visual_Math_Engine SHALL generate distractor values as integers within ±3 of the correct answer, clamped to a minimum of 0 and a maximum of 10.
5. THE Visual_Math_Engine SHALL present answer options in an order such that the correct answer does not occupy the same position across consecutive problems.
6. IF the ±3 range around the correct answer contains fewer than 3 candidate integers (after excluding the correct answer and clamping to 0–10), THEN THE Visual_Math_Engine SHALL expand the range by 1 in each direction until 3 distinct distractor values are available.

### Requirement 5: Answer Handling and Feedback

**User Story:** As a child, I want to know right away if my answer is correct, so that I can learn from my mistakes without frustration.

#### Acceptance Criteria

1. WHEN the child selects the correct answer, THE Activity_Page SHALL display the CelebrationOverlay animation with an encouragement message, disable all answer options for the celebration duration of 2500 milliseconds, and then advance to the next question automatically.
2. WHEN the child selects an incorrect answer, THE Activity_Page SHALL play an encouragement sound, mark the selected option with an incorrect visual state, disable that selected option, and allow the child to select a different option with no limit on retry attempts.
3. WHEN the child selects an incorrect answer, THE Activity_Page SHALL mark only the selected option as incorrect visually without revealing the correct answer and without changing the visual state of unselected options.
4. THE Activity_Page SHALL preserve the correct count such that the score never decreases during a session (incorrect answers apply no penalty and do not decrement the count).
5. IF audio playback is unavailable, THEN THE Activity_Page SHALL still display all visual feedback (celebration animation, incorrect option marking, and encouragement message) without interruption.

### Requirement 6: Speech and Accessibility

**User Story:** As a child who may not read well yet, I want the problem read aloud to me, so that I can understand what to do.

#### Acceptance Criteria

1. WHEN a new question is displayed, THE Activity_Page SHALL cancel any in-progress speech and use speech synthesis to read the question's speechText aloud within 500 milliseconds of the question appearing.
2. WHEN an addition problem is presented, THE Activity_Page SHALL speak the problem in the format "What is [number] plus [number]?"
3. WHEN a subtraction problem is presented, THE Activity_Page SHALL speak the problem in the format "What is [number] minus [number]?"
4. THE Problem_Display SHALL include an aria-label on the question prompt element containing the full speechText of the current question, and an aria-live="polite" region that announces when a new question is displayed.
5. WHEN the user activates a repeat button, THE Activity_Page SHALL re-speak the current question's speechText from the beginning.
6. IF speech synthesis is not supported by the browser, THEN THE Activity_Page SHALL still display the question text visually and SHALL NOT show the repeat button.
7. THE Activity_Page SHALL use a speech rate of 0.8 and a pitch of 1.1 for all spoken output to maintain a child-friendly pace and tone.

### Requirement 7: Session Flow and Navigation

**User Story:** As a child, I want to play through a set of problems and see my progress, so that I feel a sense of accomplishment.

#### Acceptance Criteria

1. THE Activity_Page SHALL display a progress bar showing the current question number relative to the total questions in the session (QUESTIONS_PER_SESSION = 5).
2. THE Activity_Page SHALL provide a back button that navigates to the math hub page at route /math.
3. WHEN all questions in the session are answered, THE Activity_Page SHALL display the CompletionScreen component with a sticker reward obtained from the useSticker hook.
4. WHEN the session is complete, THE Activity_Page SHALL offer navigation to return to the math hub (/math) or proceed to the home page (/).

### Requirement 8: Integration with Existing App

**User Story:** As a child, I want to find Visual Math Problems alongside other math activities, so that I can easily choose what to play.

#### Acceptance Criteria

1. THE Activity_Page SHALL be accessible at the route /math/visual-math-problems.
2. THE Activity_Page SHALL appear as a NavigationCard on the math hub page with a label of 20 characters or fewer, an emoji icon, and an href of "/math/visual-math-problems".
3. THE Visual_Math_Engine SHALL register "visual-math-problems" as a valid ActivityType in the type system.
4. WHEN the session isComplete flag becomes true, THE Activity_Page SHALL call recordActivityCompletion with the activityType "visual-math-problems", the number of correct answers, and the total number of questions in the session.
5. IF the user navigates away from the Activity_Page before the session is complete, THEN THE Activity_Page SHALL discard the incomplete session without recording progress.
