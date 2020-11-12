import type { ElementLike, MultipleElementLike } from 'typings';
import { matchesProperty } from '../environment/HTMLElement';
import { isHTMLElement, isNodeList, isHTMLCollection } from './test';

const toArray = Function.prototype.bind.call(
  Function.prototype.call,
  Array.prototype.slice,
);

/**
 * Wrapper that normalize `document` variable inside a special context,
 * like inside an iframe element.
 *
 * @param node - The element or the node that we search for the document from.
 * @returns The found document.
 */
function getOwnerDocument(node?: Node): Document {
  return (node && node.ownerDocument) || document;
}

/**
 * Find the element that matches selector given as argument. Return the argument as-is
 * if it already is a HTMLElement.
 *
 * @param value - The element or a selector for the element we are looking for.
 * @returns Normalized HTMLElement.
 */
export function getElement(
  value: ElementLike,
  context: Document | HTMLElement = document,
): HTMLElement {
  if (typeof value === 'string') {
    return context.querySelector(value);
  }
  if (isHTMLElement(value)) {
    return value;
  }
  return null;
}

/**
 * Find all elements matching passed selector from DOM, and return them as an array type.
 * If the argument is already a NodeList/HTMLCollection or an array, return it as-is.
 *
 * @param value - The collection of element or a selector for the elements we are looking for.
 * @returns Array of normalized HTMLElement.
 */
export function getAllElements(value: MultipleElementLike): HTMLElement[] {
  if (typeof value === 'string') {
    const elements = document.querySelectorAll(value);
    return elements.length ? toArray(elements) : null;
  }
  if (isNodeList(value) || isHTMLCollection(value)) {
    return toArray(value);
  }
  if (Array.isArray(value)) {
    return value;
  }
  return null;
}

/**
 * Invoke `callback` function on each element provided.
 *
 * @param value - The element on which to execute callback.
 * @param callback - The function to execute.
 */
export function onEachElement(
  value: ElementLike | MultipleElementLike,
  callback: (element: HTMLElement) => unknown,
): void {
  if (isHTMLElement(value)) {
    callback(value);
  } else {
    const elements = getAllElements(value);
    if (!elements) {
      throw new Error(`No element found matching the selector.`);
    }
    elements.forEach(element => callback(element));
  }
}

/**
 * Get the closest ancestor element of the `element` that matches the `selector`.
 *
 * @param element - The element from which the test starts.
 * @param selector - The selector for the lookup element.
 * @param limitElement - Optional element that delimits the search.
 * @returns The closest element found.
 */
export function getClosestElement(
  element: HTMLElement,
  selector: string,
  limitElement?: HTMLElement | Document,
): HTMLElement {
  if (element[matchesProperty](selector)) {
    return element;
  }
  return element !== limitElement && element.parentElement
    ? getClosestElement(element.parentElement, selector)
    : undefined;
}

/**
 * Find the element that has focus.
 *
 * @param context - The document element.
 * @returns The active element.
 */
export function getActiveElement(
  context: Document = getOwnerDocument(),
): HTMLElement {
  // Support: IE 9 only
  // IE9 throws an "Unspecified error" accessing document.activeElement from an <iframe>
  try {
    const { activeElement } = context;
    // IE11 returns a seemingly empty object in some cases when accessing
    // document.activeElement from an <iframe>
    if (!activeElement || !activeElement.nodeName) {
      return null;
    }
    return activeElement as HTMLElement;
  } catch (error) {
    // IE throws if no active element has been found.
    return context.body;
  }
}

/**
 * Get the index of element relative to its sibling elements.
 *
 * @param element - The element of which we want the index.
 * @returns The found index.
 */
export function getElementIndex(element: HTMLElement): number {
  return getAllElements(element.parentNode.children).indexOf(element);
}
