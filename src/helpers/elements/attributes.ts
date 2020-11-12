import type { UnknownObject } from 'typings';
import { eachValueKey } from '../primitives/objects';

/**
 * Assign multiple attributes to the passed element.
 *
 * @param element - The element to add attributes.
 * @param attributes - Collection of attribute key/value pairs.
 */
export function setAttributes(
  element: HTMLElement | SVGElement,
  attributes: UnknownObject,
): void {
  eachValueKey(attributes, (value, property) => {
    element.setAttribute(String(property), String(value));
  });
}

export function removeAttributes(
  element: HTMLElement | SVGElement,
  attributes: string[],
): void {
  attributes.forEach(attribute => {
    element.removeAttribute(attribute);
  });
}
