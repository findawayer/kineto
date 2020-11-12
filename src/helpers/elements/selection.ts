import { returnFalse } from '../primitives/functions';
import { userSelectProperty } from '../environment/CSS';

/**
 * Prevent selecting content in `element` by dragging on it.
 *
 * @param element - The element to block selection.
 */
export function preventSelection(element: HTMLElement): void {
  // Prevent select, drag event
  element.onselectstart = returnFalse;
  element.ondragstart = returnFalse;
  // Declare `user-select: none` style
  element.style[userSelectProperty] = 'none';
}

/**
 * Remove the effects of `preventSelection` above.
 *
 * @param element - The element to reset.
 */
export function releaseSelection(element: HTMLElement): void {
  element.onselectstart = null;
  element.ondragstart = null;
  element.style[userSelectProperty] = '';
}
