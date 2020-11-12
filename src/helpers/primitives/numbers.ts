/**
 * Test if the provided value is a number.
 *
 * @param value - The value to test.
 * @returns Whether the value is a number.
 */
export function isNumber(value: unknown): value is number {
  // Exclude NaN and Infinity, -Infinity from numeric values.
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}
