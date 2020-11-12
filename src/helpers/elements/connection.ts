import type { ElementLike } from 'typings';
import { getElement } from './query';

/**
 * Insert an element tree as the last child of the `parent` element.
 *
 * @param element - The element to insert.
 * @param parent - The parent element or its selector
 */
export function appendElementTree(
  element: HTMLElement,
  parent: ElementLike,
): void {
  const parentElement = getElement(parent);
  const fragment = document.createDocumentFragment();
  fragment.appendChild(element);
  parentElement.appendChild(fragment);
}

/**
 * Insert an element tree as the nth child of the `parent` element.
 *
 * @param element - The element to insert.
 * @param parent - The parent element or its selector
 * @param index - The index of the element to insert.
 */
export function insertElementTreeNth(
  element: HTMLElement,
  parent: ElementLike,
  index: number,
): void {
  const parentElement = getElement(parent);
  const nthChildElement = parentElement.children[index];
  const fragment = document.createDocumentFragment();
  fragment.appendChild(element);
  if (nthChildElement) {
    parentElement.insertBefore(fragment, nthChildElement);
  } else {
    // IE doesn't work if the 2nd argument is undefined.
    parentElement.appendChild(fragment);
  }
}

/**
 * Insert an element tree as the first child of the `parent` element.
 *
 * @param element - The element to insert.
 * @param parent - The parent element or its selector
 */
export function prependElementTree(
  element: HTMLElement,
  parent: ElementLike,
): void {
  insertElementTreeNth(element, parent, 0);
}

/**
 * Remove the passed element from DOM and returns it for later reuse.
 *
 * @param element - The element to detach from DOM.
 * @returns The detached element.
 */
export function detachElement<T extends HTMLElement | SVGElement>(
  element: T,
): T {
  const { parentElement } = element;
  parentElement && parentElement.removeChild(element);
  return element;
}

/**
 * Remove all child elements within the passed `element` tree.
 *
 * @param element - The element to remove its children.
 */
export function emptyElement(element: HTMLElement): void {
  while (element.lastElementChild) {
    element.removeChild(element.lastElementChild);
  }
}
