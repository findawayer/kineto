import type { UnknownObject } from 'typings';
import { setAttributes } from './attributes';

/**
 * Create a new HTMLElement with attributes passed.
 *
 * @param nodeName - The name of element to be created.
 * @param attributes - Initial attributes that the new element should have.
 */
export function createElement<T extends HTMLElement>(
  nodeName: string,
  attributes?: UnknownObject,
): T {
  const element = document.createElement(nodeName);
  if (attributes) setAttributes(element, attributes);
  return element as T;
}

/**
 * Create a new SVGElement with attributes passed.
 *
 * @param nodeName - The name of element to be created.
 * @param attributes - Initial attributes that the new element should have.
 */
export function createSVGElement(
  nodeName: string,
  attributes?: UnknownObject,
): SVGElement {
  const namespace = 'http://www.w3.org/2000/svg';
  const element = document.createElementNS(namespace, nodeName);
  if (attributes) setAttributes(element, attributes);
  return element;
}
