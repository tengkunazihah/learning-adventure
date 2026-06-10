import type { Question, AnswerOption } from '@/types/activity';
import {
  MATH_OBJECT_TYPES,
  QUESTIONS_PER_SESSION,
  ANSWER_OPTIONS_COUNT,
} from '@/lib/constants';
import { randomInt, shuffle, randomPick } from '@/lib/random';

/**
 * Represents a generated math problem with operands, operator, answer, and object type.
 */
export interface MathProblem {
  operand1: number;
  operand2: number;
  operator: 'addition' | 'subtraction';
  correctAnswer: number;
  objectType: string;
}

/**
 * Represents parsed metadata extracted from a visual math question ID.
 */
export interface ParsedMathQuestion {
  operator: 'addition' | 'subtraction';
  operand1: number;
  operand2: number;
  objectType: string;
}

/**
 * Generates a single math problem respecting arithmetic constraints.
 *
 * Addition: operand1 ∈ [1,9], operand2 ∈ [1,9], sum ≤ 10
 * Subtraction: minuend ∈ [2,10], subtrahend ∈ [1, minuend-1], difference ≥ 1
 */
export function generateMathProblem(): MathProblem {
  const operator: 'addition' | 'subtraction' =
    Math.random() < 0.5 ? 'addition' : 'subtraction';

  const objectType = randomPick(MATH_OBJECT_TYPES);

  let operand1: number;
  let operand2: number;
  let correctAnswer: number;

  if (operator === 'addition') {
    // operand1 ∈ [1,9], operand2 ∈ [1,9], sum ≤ 10
    operand1 = randomInt(1, 9);
    const maxOp2 = Math.min(9, 10 - operand1);
    operand2 = randomInt(1, maxOp2);
    correctAnswer = operand1 + operand2;
  } else {
    // minuend ∈ [2,10], subtrahend ∈ [1, minuend-1], difference ≥ 1
    operand1 = randomInt(2, 10);
    operand2 = randomInt(1, operand1 - 1);
    correctAnswer = operand1 - operand2;
  }

  return { operand1, operand2, operator, correctAnswer, objectType };
}

/**
 * Generates distractor values for a visual math question.
 *
 * Produces `count` unique integers within ±3 of the correct answer,
 * clamped to [0, 10]. If fewer than `count` candidates exist in the
 * initial range, the range expands by 1 in each direction until enough
 * candidates are available.
 */
export function generateDistractors(correctAnswer: number, count: number = 3): number[] {
  let range = 3;

  while (true) {
    const min = Math.max(0, correctAnswer - range);
    const max = Math.min(10, correctAnswer + range);

    const candidates: number[] = [];
    for (let i = min; i <= max; i++) {
      if (i !== correctAnswer) {
        candidates.push(i);
      }
    }

    if (candidates.length >= count) {
      const shuffled = shuffle(candidates);
      return shuffled.slice(0, count);
    }

    range += 1;
  }
}

/**
 * Generates a single visual math question with encoded ID, options, and speech text.
 *
 * Question ID format: visual-math-{operator}-{op1}-{op2}-{objectType}-{timestamp}-{random}
 */
export function generateVisualMathQuestion(): Question {
  const problem = generateMathProblem();
  const { operand1, operand2, operator, correctAnswer, objectType } = problem;

  const distractors = generateDistractors(correctAnswer, ANSWER_OPTIONS_COUNT - 1);

  // Build all option values (correct + distractors)
  const allValues = [correctAnswer, ...distractors];

  // Create AnswerOption objects
  const options: AnswerOption[] = allValues.map((value, index) => ({
    id: `option-${index}`,
    label: String(value),
    value,
  }));

  // Shuffle options so correct answer isn't always first
  const shuffledOptions: AnswerOption[] = shuffle(options);

  // Re-assign IDs after shuffle to keep them consistent
  const finalOptions: AnswerOption[] = shuffledOptions.map((opt, index) => ({
    ...opt,
    id: `option-${index}`,
  }));

  // Find the correct option's ID
  const correctOption = finalOptions.find((opt) => opt.value === correctAnswer)!;

  // Build question ID with encoded metadata
  const timestamp = Date.now();
  const rand = randomInt(0, 9999);
  const questionId = `visual-math-${operator}-${operand1}-${operand2}-${objectType}-${timestamp}-${rand}`;

  // Build prompt and speech text
  const operatorSymbol = operator === 'addition' ? '+' : '−';
  const prompt = `What is ${operand1} ${operatorSymbol} ${operand2}?`;

  const operatorWord = operator === 'addition' ? 'plus' : 'minus';
  const speechText = `What is ${operand1} ${operatorWord} ${operand2}?`;

  return {
    id: questionId,
    type: 'visual-math-problems',
    prompt,
    options: finalOptions,
    correctOptionId: correctOption.id,
    speechText,
  };
}

/**
 * Generates a batch of visual math questions for a session.
 *
 * Produces exactly QUESTIONS_PER_SESSION + 5 questions with:
 * - ~50/50 operator split (40-60% each)
 * - No consecutive duplicate (operand1, operand2, operator) triples
 */
export function generateVisualMathQuestions(): Question[] {
  const totalQuestions = QUESTIONS_PER_SESSION + 5;
  const questions: Question[] = [];

  // Generate questions ensuring no consecutive duplicates
  for (let i = 0; i < totalQuestions; i++) {
    let question: Question;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      question = generateVisualMathQuestion();
      attempts++;
    } while (
      attempts < maxAttempts &&
      questions.length > 0 &&
      isConsecutiveDuplicate(questions[questions.length - 1], question)
    );

    questions.push(question);
  }

  // Verify operator balance (~50/50 split, 40-60% each)
  // If unbalanced, regenerate with forced operators
  const additionCount = questions.filter((q) => {
    const parsed = parseMathQuestionId(q.id);
    return parsed?.operator === 'addition';
  }).length;

  const additionRatio = additionCount / totalQuestions;

  if (additionRatio < 0.4 || additionRatio > 0.6) {
    return generateBalancedBatch(totalQuestions);
  }

  return questions;
}

/**
 * Generates a balanced batch ensuring 40-60% split for each operator
 * and no consecutive duplicate triples.
 */
function generateBalancedBatch(totalQuestions: number): Question[] {
  const minAddition = Math.ceil(totalQuestions * 0.4);
  const maxAddition = Math.floor(totalQuestions * 0.6);
  const targetAddition = randomInt(minAddition, maxAddition);
  const targetSubtraction = totalQuestions - targetAddition;

  // Generate problems with specified operators
  const additionProblems: Question[] = [];
  const subtractionProblems: Question[] = [];

  for (let i = 0; i < targetAddition; i++) {
    additionProblems.push(generateQuestionWithOperator('addition'));
  }
  for (let i = 0; i < targetSubtraction; i++) {
    subtractionProblems.push(generateQuestionWithOperator('subtraction'));
  }

  // Interleave to avoid consecutive duplicates
  const allProblems = [...additionProblems, ...subtractionProblems];
  let result = shuffle(allProblems);

  // Fix any remaining consecutive duplicates
  const maxFixAttempts = 50;
  let fixAttempts = 0;
  while (fixAttempts < maxFixAttempts && hasConsecutiveDuplicates(result)) {
    result = shuffle(allProblems);
    fixAttempts++;
  }

  // If still has duplicates after shuffling, swap individual questions
  if (hasConsecutiveDuplicates(result)) {
    for (let i = 1; i < result.length; i++) {
      if (isConsecutiveDuplicate(result[i - 1], result[i])) {
        // Replace the duplicate with a new question
        let newQuestion: Question;
        let attempts = 0;
        do {
          const op = i % 2 === 0 ? 'addition' : 'subtraction';
          newQuestion = generateQuestionWithOperator(op);
          attempts++;
        } while (
          attempts < 50 &&
          isConsecutiveDuplicate(result[i - 1], newQuestion)
        );
        result[i] = newQuestion;
      }
    }
  }

  return result;
}

/**
 * Generates a question with a specific operator.
 */
function generateQuestionWithOperator(operator: 'addition' | 'subtraction'): Question {
  let question: Question;
  do {
    question = generateVisualMathQuestion();
    const parsed = parseMathQuestionId(question.id);
    if (parsed?.operator === operator) {
      return question;
    }
  } while (true);
}

/**
 * Checks if two questions have the same (operand1, operand2, operator) triple.
 */
function isConsecutiveDuplicate(prev: Question, current: Question): boolean {
  const prevParsed = parseMathQuestionId(prev.id);
  const currentParsed = parseMathQuestionId(current.id);

  if (!prevParsed || !currentParsed) return false;

  return (
    prevParsed.operand1 === currentParsed.operand1 &&
    prevParsed.operand2 === currentParsed.operand2 &&
    prevParsed.operator === currentParsed.operator
  );
}

/**
 * Checks if any consecutive pair in the array has a duplicate triple.
 */
function hasConsecutiveDuplicates(questions: Question[]): boolean {
  for (let i = 1; i < questions.length; i++) {
    if (isConsecutiveDuplicate(questions[i - 1], questions[i])) {
      return true;
    }
  }
  return false;
}

/**
 * Parses a visual math question ID to extract operator, operands, and object type.
 *
 * Expected format: visual-math-{operator}-{op1}-{op2}-{objectType}-{timestamp}-{random}
 * Returns null for malformed IDs.
 */
export function parseMathQuestionId(id: string): ParsedMathQuestion | null {
  const prefix = 'visual-math-';
  if (!id.startsWith(prefix)) return null;

  const rest = id.slice(prefix.length);

  // Try to match addition or subtraction
  let operator: 'addition' | 'subtraction';
  let remaining: string;

  if (rest.startsWith('addition-')) {
    operator = 'addition';
    remaining = rest.slice('addition-'.length);
  } else if (rest.startsWith('subtraction-')) {
    operator = 'subtraction';
    remaining = rest.slice('subtraction-'.length);
  } else {
    return null;
  }

  // remaining: {op1}-{op2}-{objectType}-{timestamp}-{random}
  const parts = remaining.split('-');
  if (parts.length < 4) return null;

  const operand1 = parseInt(parts[0], 10);
  const operand2 = parseInt(parts[1], 10);

  if (isNaN(operand1) || isNaN(operand2)) return null;

  // Object type is the third part (before timestamp and random)
  // We know the last two parts are timestamp and random
  // objectType could be a single segment
  const objectType = parts[2];

  if (!objectType || objectType.length === 0) return null;

  return { operator, operand1, operand2, objectType };
}
