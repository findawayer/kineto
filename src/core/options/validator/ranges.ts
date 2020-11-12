import { clamp, eachValueKey, inRange } from 'helpers';
import type { BaseOptions } from 'typings';

/**
 * Options that should be limited within a logical range of numbers.
 */
const rangeSchema = {
  swipeEdgeFriction: { min: 0, max: 1 },
  cssPrecision: { min: 0, max: 10 },
};

/**
 * Make sure any numeric value matching the `rangeSchema` above
 * is out of the predefined range. If so, limit the value in that range.
 * Note that this mutates the passed options, and does NOT return any value.
 *
 * @param {object} options - The options to test.
 */
function checkRanges(options: BaseOptions): void {
  eachValueKey(rangeSchema, ({ min, max }, key) => {
    const value = options[key];
    if (typeof value === 'number' && !inRange(value, min, max)) {
      options[key] = clamp(value, min, max);
      console.warn(
        `The value of '${key}' exceeds expected range; rounded to within '${min}~${max}'.`,
      );
    }
  });
}

export { checkRanges };
