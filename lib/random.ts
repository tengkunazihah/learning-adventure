/**
 * Randomization utilities used across activity question generators.
 */

/**
 * Returns a random integer between min and max (inclusive).
 */
export function randomInt(min: number, max: number): number {
  const lo = Math.ceil(min);
  const hi = Math.floor(max);
  return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

/**
 * Returns a new array with elements shuffled using the Fisher-Yates algorithm.
 * Does not mutate the input array.
 */
export function shuffle<T>(array: readonly T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Returns a random element from the array.
 * Throws if the array is empty.
 */
export function randomPick<T>(array: readonly T[]): T {
  if (array.length === 0) {
    throw new Error('Cannot pick from an empty array');
  }
  return array[randomInt(0, array.length - 1)];
}

/**
 * Picks n unique random elements from the array.
 * Throws if n is greater than the array length.
 */
export function randomPickN<T>(array: readonly T[], n: number): T[] {
  if (n > array.length) {
    throw new Error(
      `Cannot pick ${n} unique elements from an array of length ${array.length}`
    );
  }
  const shuffled = shuffle(array);
  return shuffled.slice(0, n);
}
