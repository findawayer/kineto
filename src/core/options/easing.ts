import type { EasingFunction } from 'bezier-easing';
import bezierEasing from 'bezier-easing';
import { hasKey } from 'helpers';
import type { EasingPoints, EasingPreset, EasingOption } from 'typings';

const defaultEasing: EasingPoints = [0, 0, 0.2, 1];

/**
 * Pre-defined easing preset
 * @see: https://github.com/ai/easings.net
 */
const easingPreset: Record<EasingPreset, EasingPoints> = {
  linear: [0, 0, 1, 1],
  ease: [0.25, 0.1, 0.25, 1],
  easeIn: [0.42, 0, 1, 1],
  easeOut: [0, 0, 0.58, 1],
  easeInOut: [0.42, 0, 0.58, 1],
  easeInSine: [0.47, 0, 0.745, 0.745],
  easeOutSine: [0.39, 0.575, 0.565, 1],
  easeInOutSine: [0.445, 0.05, 0.55, 0.95],
  easeInQuad: [0.55, 0.085, 0.68, 0.53],
  easeOutQuad: [0.25, 0.46, 0.45, 0.94],
  easeInOutQuad: [0.455, 0.03, 0.515, 0.955],
  easeInCubic: [0.55, 0.055, 0.675, 0.19],
  easeOutCubic: [0.215, 0.61, 0.355, 1],
  easeInOutCubic: [0.645, 0.045, 0.355, 1],
  easeInQuart: [0.895, 0.03, 0.685, 0.22],
  easeOutQuart: [0.165, 0.84, 0.44, 1],
  easeInOutQuart: [0.77, 0, 0.175, 1],
  easeInQuint: [0.755, 0.05, 0.855, 0.06],
  easeOutQuint: [0.23, 1, 0.32, 1],
  easeInOutQuint: [0.86, 0, 0.07, 1],
  easeInExpo: [0.95, 0.05, 0.795, 0.035],
  easeOutExpo: [0.19, 1, 0.22, 1],
  easeInOutExpo: [1, 0, 0, 1],
  easeInCirc: [0.6, 0.04, 0.98, 0.335],
  easeOutCirc: [0.075, 0.82, 0.165, 1],
  easeInOutCirc: [0.785, 0.135, 0.15, 0.86],
  easeInBack: [0.6, -0.28, 0.735, 0.045],
  easeOutBack: [0.175, 0.885, 0.32, 1.275],
  easeInOutBack: [0.68, -0.55, 0.265, 1.55],
};

/**
 * Test if the value is a key of easing preset object above.
 *
 * @param value - The input value to test.
 * @returns Whether the value is an easing preset name.
 */
function isValidEasingPreset(
  value: unknown,
): value is keyof typeof easingPreset {
  return typeof value === 'string' && hasKey(easingPreset, value);
}

/**
 * Test if the value conforms to a bezier easing points format.
 *
 * @param value - The input value to test.
 * @returns Whether the value is easing points.
 */
function isValidEasingPoints(value: unknown): value is EasingPoints {
  return Array.isArray(value) && value.length === 4;
}

/**
 * Convert a bezier easing points or a preset name to an easing function.
 * This makes use of `bezier-easing` module.
 *
 * @param query - Easing preset name or an array of bezier points.
 * @returns Converted easing function.
 *
 * @example
 *  getEasingFunction('easeOutSine');
 *  getEasingFunction([0.17, 0.67, 0.83, 0.67]);
 */
function getEasingFunction(query: EasingOption): EasingFunction {
  let points: EasingPoints;
  if (isValidEasingPreset(query)) {
    points = easingPreset[query];
  } else if (isValidEasingPoints(query)) {
    points = query;
  } else {
    points = defaultEasing;
  }
  return bezierEasing(...points);
}

export { defaultEasing, getEasingFunction };
