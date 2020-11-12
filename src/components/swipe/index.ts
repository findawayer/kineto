/**
 * @overview
 * The swipe component implements movement between slides by dragging with touch or a mouse.
 * It is activated when user sets a truthy value for either `touchSwipe` or `mouseSwipe` option.
 */

import {
  addEvent,
  findClosest,
  modulo,
  preventSelection,
  releaseSelection,
} from 'helpers';
import type { KinetoInterface } from 'typings';
import { defaultOptions } from 'core/options';
import { handleStart } from './event';
import { addTrace, applyEdgeFriction, getVelocity } from './helpers';

/**
 * Initialize the component.
 *
 * @this kineto - Current Kineto instance.
 */
function init(this: KinetoInterface): void {
  const { frame, options, swipe } = this;
  // The DOM element receiving swipe events
  const target = frame.element;
  swipe.target = target;
  // Reference to attached event listeners
  swipe.removeListeners = [];
  swipe.removeDynamicListeners = [];
  // Prevent swiping actions from triggering content selection
  preventSelection(target);
  // Listen to touch swipe event
  if (options.touchSwipe) {
    swipe.removeListeners.push(
      addEvent({
        target,
        type: 'touchstart',
        listener: handleStart.bind(this) as EventListener,
        options: { passive: true },
      }),
    );
  }
  // Listen to mouse swipe event
  if (options.mouseSwipe) {
    swipe.removeListeners.push(
      addEvent({
        target,
        type: 'mousedown',
        listener: handleStart.bind(this) as EventListener,
      }),
    );
  }
}

/**
 * Reset changes made while creating the component.
 *
 * @this kineto - Current Kineto instance.
 */
function destroy(this: KinetoInterface): void {
  const { swipe } = this;
  // Revert content selection that has been blocked
  releaseSelection(swipe.target);
  // Remove DOM event listeners
  if (swipe.removeListeners) {
    swipe.removeListeners.forEach(remove => remove());
  }
  if (swipe.removeDynamicListeners) {
    swipe.removeDynamicListeners.forEach(remove => remove());
  }
  delete swipe.target;
  delete swipe.eventId;
  delete swipe.isTouch;
  delete swipe.isScroll;
  delete swipe.hasMoved;
  delete swipe.hasReleased;
  delete swipe.startTime;
  delete swipe.startX;
  delete swipe.startY;
  delete swipe.startTranslate;
  delete swipe.currentTranslate;
  delete swipe.nextTranslate;
  delete swipe.trace;
  delete swipe.velocity;
  delete swipe.removeListeners;
  delete swipe.removeDynamicListeners;
}

/**
 * Move the scope in the same direction as pointer/touch movement. This function will
 * replace the default tick `animation.update`; and will recursively call itself until
 * `this.animation.stop()` is manually invoked in `handleEnd` handler.
 *
 * @this kineto - Current Kineto instance.
 */
function follow(this: KinetoInterface): void {
  const { animation, swipe } = this;
  const { currentTranslate, hasMoved, nextTranslate } = swipe;
  // Only when translate value has an update
  if (hasMoved && nextTranslate !== currentTranslate) {
    // Update translate
    swipe.currentTranslate = nextTranslate;
    // Render this frame
    this.scope.render({ translate: nextTranslate });
  }
  // Continue updating frame
  animation.frameId = requestAnimationFrame(animation.tick);
}

/**
 * Restore position of the scope matching the current index. This invokes
 * `move()` method in place of `goTo()`, in order to prevent dispatching
 * internal events. This method is used to bounce back to the initial position
 * after a micro movement by swipe.
 */
function restore(this: KinetoInterface): void {
  // const { currentIndex } = this;
  // this.moveTo(currentIndex);
  const { animation, currentIndex, scope } = this;
  animation.start({ targetTranslate: scope.snap[currentIndex] });
}

/**
 * Move to targeting slide using momentum, after user releases the handle.
 *
 * @todo Remove magic number from the nextTranslate algorithm.
 */
function moveToTarget(this: KinetoInterface): void {
  const { animation, isLooped, scope, swipe } = this;
  // Calculate velocity out of the movement trace
  const velocity = swipe.getVelocity();
  // Use velocity and distance of the swipe movement to calculate
  // the destination position.
  let nextTranslate = scope.translate + velocity * 10;
  let nextIndex: number;
  // Snap the translate to slide
  if (isLooped) {
    const loopedTranslate = modulo(nextTranslate, scope.range) - scope.range;
    const restTranslate = findClosest(loopedTranslate, scope.snap);
    nextTranslate = nextTranslate - loopedTranslate + restTranslate;
    nextIndex = scope.snap.indexOf(restTranslate);
  } else {
    nextTranslate = findClosest(nextTranslate, scope.snap);
    nextIndex = scope.snap.indexOf(nextTranslate);
  }
  // Update current index
  this.updateIndex(nextIndex);
  // Slide to the targeting position
  animation.start({
    targetTranslate: nextTranslate,
    duration: defaultOptions.speed,
    easing: defaultOptions.easing,
  });
}

export default {
  name: 'swipe',
  test: ['touchSwipe', 'mouseSwipe'],
  init,
  destroy,
  bind: {
    follow,
    restore,
    moveToTarget,
    addTrace,
    getVelocity,
    applyEdgeFriction,
  },
};
