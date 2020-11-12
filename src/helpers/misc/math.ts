/**
 * Round number `x` within `lower` ~ `upper` range.
 *
 * @param x - The number to round.
 * @param lower - Minimum possible number.
 * @param upper - Maximum possible number.
 * @returns The rounded value x.
 */
export function clamp(x: number, lower: number, upper: number): number {
  if (x < lower) return lower;
  if (x > upper) return upper;
  return x;
}

/**
 * Test if `x` is a number within `lower` ~ `upper` range.
 *
 * @param x - The number to test.
 * @param lower - Minimum possible number.
 * @param upper - Maximum possible number.
 * @returns Whether the number x is in the range given.
 */
export function inRange(x: number, lower: number, upper: number): boolean {
  return lower <= x && x <= upper;
}

/**
 * Get the remainder from modulo operation on number `x`
 * (either positive or negative) by diviser `upper`.
 *
 * @param x - The number to round.
 * @param upper - Maximum possible number.
 * @returns Modulo x.
 */
export function modulo(x: number, upper: number): number {
  return ((x % upper) + upper) % upper;
}

/**
 * Test if number `x` is an integer
 *
 * @param x - The number to test.
 * @returns Whether the number x is an integer.
 */
export function isInteger(x: number): boolean {
  return Number.isInteger
    ? Number.isInteger(x)
    : !isNaN(x) && Math.floor(x) === x;
}

/**
 * Test if number `x` is a float
 *
 * @param x - The number to test.
 * @returns Whether the number x is a float.
 */
export function isFloat(x: number): boolean {
  return !isNaN(x) && x % 1 !== 0;
}

/**
 * Get decimal portion of number `x`.
 *
 * @param x - The number to test.
 * @returns The part of number x after the decimal points.
 */
export function getDecimals(x: number): number {
  return x % 1;
}

/**
 * Find closest number in array of numbers.
 *
 * @param needle - The needle.
 * @param haystack - The haystack.
 * @returns The closest number in the array provided.
 */
export function findClosest(needle: number, haystack: number[]): number {
  return haystack.reduce((previous, current) => {
    return Math.abs(current - needle) < Math.abs(previous - needle)
      ? current
      : previous;
  });
}
