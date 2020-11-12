/**
 * @overview
 * The wheel component implements movement between adjacent slides by mouse wheel.
 * Users can decide how many slides to jump with `moveBy` option, and also control
 * how much time you want to block subsequent wheel trials with `wheelThrottle` option.
 * (0 to allow move freely, 'auto' to block wheel during the movement, and custom numeric
 *  value N to block for N miliseconds.)
 */

import { addEvent, getElement, isNumber, now, wheelEvent } from 'helpers';
import type { KinetoInterface, Options, ProgressiveWheelEvent } from 'typings';

/**
 * Initialize the component.
 *
 * @this kineto - Current Kineto instance.
 */
function init(this: KinetoInterface): void {
  const { wheel } = this;
  wheel.lastCall = 0;
}

/**
 * Reset changes made while creating the component.
 *
 * @this kineto - Current Kineto instance.
 */
function destroy(this: KinetoInterface): void {
  const { wheel } = this;
  // Remove DOM event listeners
  wheel.removeListener && wheel.removeListener();
  // Clear data
  delete wheel.target;
  delete wheel.lastCall;
  delete wheel.removeListener;
}

/**
 * Update settings of the component based on the current options. Any changes
 * that should be made after options
 *
 * @this kineto - Current Kineto instance.
 * @param nextOptions - Changed new options.
 * @param currentOptions - Old options before being changed.
 */
function config(
  this: KinetoInterface,
  nextOptions: Options,
  currentOptions: Options,
): void {
  const { container, options, wheel } = this;
  if (
    !currentOptions ||
    nextOptions.wheelTarget !== currentOptions.wheelTarget
  ) {
    wheel.target = getElement(options.wheelTarget || container.element);
    // Reset wheel listener first, if any
    wheel.removeListener && wheel.removeListener();
    // Renew event target and reattach event listener
    wheel.removeListener = addEvent<HTMLElement>({
      target: wheel.target,
      type: wheelEvent,
      listener: handleWheel.bind(this),
      // No `passive` option intended — we actually want to block the scroll
    });
  }
}

/**
 * Move back and forth when wheel event is triggered.
 *
 * @this kineto - Current Kineto instance.
 * @param event - MouseEvent object created with wheel event.
 */
function handleWheel(this: KinetoInterface, event: Event): void {
  const {
    options: { wheelEdgeRelease, wheelThrottle },
    wheel,
  } = this;
  const currentTime = now();
  const isThrottled = isNumber(wheelThrottle)
    ? currentTime - wheel.lastCall < wheelThrottle
    : this.animation.isActive;
  const delta = getDelta(event as ProgressiveWheelEvent);
  const isBackward = delta > 0;
  let disableScroll = true;

  if (!isThrottled) {
    if (isBackward ? this.hasPreviousSlide() : this.hasNextSlide()) {
      isBackward ? this.previous() : this.next();
      wheel.lastCall = currentTime;
    } else if (wheelEdgeRelease) {
      disableScroll = false;
    }
  }

  if (disableScroll) {
    event.preventDefault();
  }
}

/**
 * Get direction as a numeric value, using delta of the `event` object.
 * We don't need to normalize the threshold, because we only need the direction.
 * Note that legacy FireFox only events(DOMMouseScroll, MozMousePixelScroll) are
 * not supported.
 *
 * @param event - The wheel event.
 * @returns The wheel delta
 */
function getDelta(event: ProgressiveWheelEvent): number {
  let deltaX;
  let deltaY;
  // Legacy `scrollwheel` event delta
  if ('wheelDelta' in event) {
    deltaY = event.wheelDelta;
  }
  if ('wheelDeltaY' in event) {
    deltaY = event.wheelDeltaY;
  }
  if ('wheelDeltaX' in event) {
    deltaX = event.wheelDeltaX * -1;
  }
  // `wheel` event delta
  if ('deltaY' in event) {
    deltaY = event.deltaY * -1;
  }
  if ('deltaX' in event) {
    deltaX = event.deltaX;
  }
  // Greather delta is the delta
  return Math.abs(deltaY) > Math.abs(deltaX) ? deltaY : deltaX;
}

export default {
  name: 'wheel',
  test: 'wheel',
  init,
  destroy,
  bind: {
    handleWheel,
  },
  on: {
    config,
  },
};
