import {
  addEvents,
  clamp,
  getActiveElement,
  getEventCoordinates,
  isInteractiveElement,
  isLeftClickEvent,
  isTouchEvent,
  now,
} from 'helpers';
import type { KinetoInterface, SwipeEvent } from 'typings';

/**
 * When a touch or a mouse click is initiated on the carousel, set initial values
 * and start watching touch/mouse movement and release.
 *
 * @this kineto - Current Kineto instance.
 * @param event - Event object created by touchstart/mousedown event.
 */
function handleStart(this: KinetoInterface, event: SwipeEvent): void {
  const { scope, swipe } = this;
  const isTouch = isTouchEvent(event);
  // Reject non-left clicks
  if (!isTouch && !isLeftClickEvent(event)) {
    return;
  }
  const { id, x, y } = getEventCoordinates(event, isTouch);
  const currentTime = now();
  const currentTranslate = scope.translate;
  const BoundHandleMove = handleMove.bind(this) as EventListener;
  const BoundHandleEnd = handleEnd.bind(this) as EventListener;

  // Event identifier to distinguish multi-touch events
  // (Only multi-touch events have a value assigned)
  swipe.eventId = id;
  // Whether the swipe event is a touch event
  swipe.isTouch = isTouch;
  // Whether the swipe event is a scroll attempt
  swipe.isScroll = false;
  swipe.hasMoved = false;
  swipe.hasReleased = false;
  swipe.startTime = currentTime;
  swipe.startX = x;
  swipe.startY = y;
  swipe.startTranslate = currentTranslate;
  swipe.currentTranslate = currentTranslate;
  swipe.trace = [];
  // swipe.trackTranslate = scope.translate;
  swipe.addTrace(0);
  // Watch swipe movements and reflect them to actual animation
  this.animation.start({ tick: swipe.follow });
  // Add state class
  this.addStateClass('swiping');
  // Dispatch event (this stops possible exisiting stream)
  this.emit('interact');

  // 1. Add move/end event runtime event handlers
  // 2. Prevent default action
  if (isTouch) {
    // Listen to touch swipe events
    swipe.removeDynamicListeners = addEvents(
      {
        type: 'touchmove',
        target: document,
        listener: BoundHandleMove,
        options: { passive: true },
      },
      {
        type: 'touchend',
        target: document,
        listener: BoundHandleEnd,
      },
      { type: 'touchcancel', target: document, listener: BoundHandleEnd },
    );
  } else {
    // Listen to mouse swipe events
    swipe.removeDynamicListeners = addEvents(
      {
        type: 'mousemove',
        target: document,
        listener: BoundHandleMove,
      },
      { type: 'mouseup', target: document, listener: BoundHandleEnd },
    );
    // Blur element with focus
    const activeElement = getActiveElement();
    if (activeElement && activeElement !== event.target) {
      activeElement.blur();
    }
    // If the event is originated from an interactive element,
    // prevent native behavior of dragging.
    if (isInteractiveElement(event.target as HTMLElement)) {
      event.preventDefault();
    }
  }
}

/**
 * Handler for touchmove(mousemove) events. Calculate swiped distance and direction
 * by comparing event data with initial values, and move the carousel's scope
 * by that distance and direction.
 *
 * @this kineto - Current Kineto instance.
 * @param event - Event object created by touchmove/mousemove event.
 */
function handleMove(this: KinetoInterface, event: SwipeEvent): void {
  const {
    isLooped,
    isVertical,
    options: { swipeThreshold, swipeMultiplier, swipeEdgeBounce },
    scope,
    swipe,
  } = this;
  const { id, x, y } = getEventCoordinates(event, swipe.isTouch);
  // Skip if
  // 1. The event is originated from a secondary multi-touch action
  // 2. User wants to scroll, not to navigate carousel
  // 3. User already released pointer/finger.
  if (swipe.isScroll || swipe.hasReleased || id !== swipe.eventId) {
    return;
  }
  // Moved distance from the initial point
  const delta = isVertical ? y - swipe.startY : x - swipe.startX;
  // Add movement trace for velocity calculation
  swipe.addTrace(delta);
  // Figure out when we are good to start animating
  if (!swipe.hasMoved) {
    // Ignore micro movements (The movement is within `swipeThreshold` range)
    if (Math.abs(delta) < swipeThreshold) {
      return;
    }
    // Moved enough to be considered a swipe;
    swipe.hasMoved = true;
  }
  // Update `swipenextTranslate` value based on the swipe movement; `swipe.follow` method
  // will reflect this to `swipe.currentTranslate` and update the animation frame.
  const nextTranslate = swipe.startTranslate + delta * swipeMultiplier;
  // [case: looped] — use the `nextTranslate` as-is
  if (isLooped) {
    swipe.nextTranslate = nextTranslate;
  }
  // [case: has edges] [case: edgeBounce is true] — apply resistance on edges
  else if (swipeEdgeBounce) {
    swipe.nextTranslate = swipe.applyEdgeFriction(nextTranslate);
  }
  // [case: has edges] [case: edgeBounce is false] — limit movement within the bounds
  else {
    swipe.nextTranslate = clamp(
      nextTranslate,
      scope.minTranslate,
      scope.maxTranslate,
    );
  }
}

/**
 * Handler for touchend(mouseup) event. Figure out which slide we should slide to
 * after touch release, and reset dynamically assigned data.
 *
 * @this kineto - Current Kineto instance.
 * @param event - Event object created by touchend/touchcancel/mouseup event.
 */
function handleEnd(this: KinetoInterface, event: SwipeEvent): void {
  const {
    isVertical,
    options: { moveOnClick },
    slide,
    swipe,
  } = this;
  const { id, x, y } = getEventCoordinates(event, swipe.isTouch);
  // Ignore when user released secondary finger.
  if (id !== swipe.eventId) {
    return;
  }
  const deltaX = x - swipe.startX;
  const deltaY = y - swipe.startY;
  const delta = isVertical ? deltaY : deltaX;
  const oppositeDelta = isVertical ? deltaX : deltaY;
  // Stop listening to touchmove/mousemove events
  swipe.hasReleased = true;
  // Ignore scroll attempt (The movement is more oriented in the counter-axis)
  swipe.isScroll = Math.abs(oppositeDelta) > Math.abs(delta);
  // Clear dynamically added listeners (handleMove, handleEnd)
  swipe.removeDynamicListeners.forEach(remove => remove());
  // Stop animation with swipe
  this.animation.stop();
  // Remove `swiping` class from the container
  this.removeStateClass('swiping');
  // User wants to scroll, not to navigate slides
  if (swipe.isScroll) {
    swipe.restore();
  }
  // Move to another slide by swipe
  else if (swipe.hasMoved) {
    // Add last trace
    swipe.addTrace(delta);
    // Move to targeting position
    swipe.moveToTarget();
    // This resumes previously active stream if any
    this.emit('interacted');
  }
  // Move to the tapped slide, if the gesture is a `click`
  else if (moveOnClick) {
    slide.handleClick(event as MouseEvent);
  } else {
    swipe.restore();
  }
}

export { handleStart, handleMove, handleEnd };
