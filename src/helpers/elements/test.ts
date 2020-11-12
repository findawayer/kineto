import { inArray } from '../primitives/arrays';

// Node name of focusable elements
const FOCUSABLE_ELEMENTS = [
  'A',
  'AREA',
  'AUDIO',
  'BUTTON',
  'IFRAME',
  'INPUT',
  'SELECT',
  'TEXTAREA',
  'VIDEO',
];

// Node name of form elements
const FORM_ELEMENTS = ['INPUT', 'SELECT', 'TEXTAREA'];

/**
 * Test if the provided value is a HTMLElement.
 *
 * @param value - What we expect to be a HTMLElement.
 * @returns Whether the value is a HTMLElement.
 */
export function isHTMLElement(value: unknown): value is HTMLElement {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  if (typeof HTMLElement === 'object') {
    return value instanceof HTMLElement;
  }
  return (
    (value as Element).nodeType === 1 &&
    typeof (value as Element).nodeName === 'string'
  );
}

/**
 * Test if the provided value is a NodeList.
 *
 * @param value - What we expect to be a NodeList.
 * @returns Whether the value is a NodeList.
 */
export function isNodeList(value: unknown): value is NodeList {
  return Object.prototype.isPrototypeOf.call(NodeList.prototype, value);
}

/**
 * Test if the provided value is a HTMLCollection.
 *
 * @param value - What we expect to be a HTMLCollection.
 * @returns Whether the value is a HTMLCollection.
 */
export function isHTMLCollection(value: unknown): value is HTMLCollection {
  return Object.prototype.isPrototypeOf.call(HTMLCollection.prototype, value);
}

/**
 * Test if `element` is a component node of `baseElement` tree.
 *
 * @param element - The element to test.
 * @param baseElement - The ancestor element of the tree.
 * @returns Whether the element is in the base element tree.
 */
export function isInElementTree(
  element: HTMLElement,
  baseElement: HTMLElement,
): boolean {
  return element === baseElement || baseElement.contains(element);
}

/**
 * Test if the provided element is interactive — either it can naturally have focus,
 * and/or its content can be edited.
 *
 * @param element - The element to test.
 * @returns Whether the element is interactive.
 */
export function isInteractiveElement(element: HTMLElement): boolean {
  // Focusable element or set `contenteditable`
  if (
    inArray(element.nodeName, FOCUSABLE_ELEMENTS) ||
    element.hasAttribute('contenteditable')
  ) {
    // Filter out disabled form elements
    if (inArray(element.nodeName, FORM_ELEMENTS)) {
      return !(element as HTMLSelectElement).disabled;
    }
    return true;
  }
  return false;
}

/**
 * Test if the provided element is focusable. A focusable element is basically
 * an interactive element minus case with negative `tabindex` attribute.
 *
 * @param element - The element to test.
 * @returns Whether the element is focusable.
 */
export function isFocusableElement(element: HTMLElement): boolean {
  return isInteractiveElement(element) && element.tabIndex !== -1;
}
