import type { SwipeEvent, SwipeReference } from 'typings';

/**
 * Test if an event object is originated from a click action.
 *
 * @param event - The event object to test.
 */
export function isClickEvent(event: Event): event is MouseEvent {
  return /^(?:mouse|click$)/.test(event.type);
}

/**
 * Test if an event object is originated from a touch action.
 *
 * @param event - The event object to test.
 */
export function isTouchEvent(event: Event): event is TouchEvent {
  return /^touch/.test(event.type);
}

/**
 * Test if an event object is originated from a left click action.
 *
 * @param event - The event object to test.
 */
export function isLeftClickEvent(event: Event): boolean {
  if (!isClickEvent(event)) {
    return false;
  }
  // Webkit, Firefox
  if ('which' in event) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return event.which === 1;
  }
  // IE, Old opera
  if ('button' in event) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return event.button === 1;
  }
  return false;
}

/**
 * Get x, y coordinates from a touch/mouse event, excluding secondary
 * inputs from a multi-touch event.
 *
 * @param event - The event object to test.
 * @param isTouch - Memoized value telling if the event above is a touch event.
 */
export function getEventCoordinates(
  event: SwipeEvent,
  isTouch: boolean = isTouchEvent(event),
): SwipeReference {
  const targetEvent = isTouch
    ? (event as TouchEvent).changedTouches[0]
    : (event as MouseEvent);
  return {
    id: isTouch ? (targetEvent as Touch).identifier : undefined,
    x: targetEvent.pageX,
    y: targetEvent.pageY,
  };
}
