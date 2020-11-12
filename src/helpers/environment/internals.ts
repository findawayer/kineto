import { supportsDOM } from './DOM';
import { findInArray } from '../primitives/arrays';
import { camelToPascal } from '../primitives/strings';

// Dummy element used for various tests
export const dummyElement = supportsDOM && document.createElement('div');

/**
 * Find the vendor-prefixed `property` by in the `object` provided.
 * Return the property as-is, if no vendor prefix is needed.
 *
 * @param object - Source object to find the supported property.
 * @param property - The property to find its prefix.
 * @param prefixes - Array of possible vendor prefixes.
 */
export function vendorPrefix<T>(
  object: T,
  property: string,
  prefixes = ['moz', 'ms', 'o', 'webkit'],
): string {
  if (property in object) {
    return property;
  }
  let i = 0;
  let temp;
  while (prefixes[i]) {
    temp = prefixes[i] + camelToPascal(property);
    if (temp in object) {
      return temp;
    }
    i += 1;
  }
  return undefined;
}

/**
 * Find the vendor-prefixed CSS property among the `properties` provided.
 * Return the property as-is, if no vendor prefix is needed.
 *
 * @param properties - Possible versions of CSS property.
 */
export function findCSSProperty(properties: string[]): string {
  const { style } = dummyElement;
  return findInArray(
    properties,
    property => typeof style[property] === 'string',
  );
}
