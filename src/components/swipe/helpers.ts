import { first, last, now } from 'helpers';
import type { KinetoInterface } from 'typings';

/**
 * Record swipe movement for the last 100 miliseconds.
 *
 * @param position - Current position to record. (swipe delta)
 */
function addTrace(this: KinetoInterface, position: number): void {
  const {
    swipe: { trace },
  } = this;
  const currentTime = now();
  while (trace.length > 0) {
    if (currentTime - trace[0].time <= 100) {
      break;
    }
    trace.shift();
  }
  trace.push({ time: currentTime, position });
}

/**
 * Calculate velocity out of the recorded movement history.
 *
 * @returns The velocity.
 */
function getVelocity(this: KinetoInterface): number {
  const {
    options: { swipeMultiplier },
    swipe,
  } = this;
  const firstTrace = first(swipe.trace);
  const lastTrace = last(swipe.trace);
  const positionOffset = lastTrace.position - firstTrace.position;
  const timeOffset = lastTrace.time - firstTrace.time;
  const decelerationFactor = timeOffset / 15 / swipeMultiplier;
  return positionOffset / decelerationFactor || 0; // prevent NaN
}

/**
 * Round the `translate` value down by `swipeEdgeFriction` option value.
 *
 * @param translate - The translate value to round.
 * @returns The rounded translate value.
 */
function applyEdgeFriction(this: KinetoInterface, translate: number): number {
  const {
    options: { swipeEdgeFriction },
    scope: { maxTranslate, minTranslate },
  } = this;
  if (translate < minTranslate) {
    return minTranslate + (translate - minTranslate) * (1 - swipeEdgeFriction);
  }
  if (translate > maxTranslate) {
    return maxTranslate + (translate - maxTranslate) * (1 - swipeEdgeFriction);
  }
  return translate;
}

export { addTrace, getVelocity, applyEdgeFriction };
