import type { ElementSizeData, ToCSSValueQuery, TranslateQuery } from 'typings';
import {
  transformProperty,
  transitionProperty,
  supports3dTransform,
} from '../environment/CSS';
import { eachValueKey } from '../primitives/objects';
import { isFloat } from '../misc/math';

/**
 * Convert a numeric value to string with `px` unit attached; if a numeric value
 * is provided as `percentBase`, output becomes a percent-based value relative to that number.
 * This function also limits precision of decimals for less capable browsers.
 *
 * @param percentBase - The number that the relative output should be based on.
 * @param precision - Precision after the decimal point.
 * @returns The converted CSS-friendly string.
 */
export function toCSSValue(
  pixelValue: number,
  { percentBase, precision = 3 }: ToCSSValueQuery,
): string {
  const unit = percentBase ? '%' : 'px';
  const valueAsNumber = percentBase
    ? (pixelValue / percentBase) * 100
    : pixelValue;
  const value = isFloat(valueAsNumber)
    ? valueAsNumber.toFixed(precision)
    : String(valueAsNumber);
  return value + unit;
}

/**
 * Apply multiple CSS declarations in one go.
 *
 * @param element - The element we want to stylize.
 * @param declarations - Collection of CSS property/value pairs to apply.
 */
export function setStyles(
  element: HTMLElement,
  declarations: Record<string, unknown>,
): void {
  const { style } = element;
  eachValueKey(declarations, (value, property) => {
    style[property] = value;
  });
}

/**
 * Remove multiple CSS declarations in one go. Remove all styles if `property`
 * value is not provided.
 *
 * @param element - The element we want to reset the style of.
 * @param property - Specific name(s) of CSS property(ies) to remove.
 */
export function resetStyles(
  element: HTMLElement,
  property?: string | string[],
): void {
  const { style } = element;
  if (!property) {
    element.removeAttribute('style');
  } else if (Array.isArray(property)) {
    property.forEach(prop => {
      style[prop] = '';
    });
  } else {
    style[property] = '';
  }
}

/**
 * Get width and height size of the element without unit.
 *
 * @param element - The element we want to measure.
 * @returns The data map of width and height.
 */
export function getSize(element: HTMLElement): ElementSizeData {
  const rect = HTMLElement.prototype.getBoundingClientRect.call(element);
  return {
    width: rect.right - rect.left,
    height: rect.bottom - rect.top,
  };
}

/**
 * Remove explicitely set width, height CSS declaration from the element.
 *
 * @param element - The element to reset the width/height.
 */
export function resetSize(element: HTMLElement): void {
  if (element.style.width !== '') {
    element.style.width = '';
  }
  if (element.style.height !== '') {
    element.style.height = '';
  }
}

/**
 * Transform an element using the translate query passed. Setting `use3d` to true
 * will make it use 3d transform instead of the default 2d transform.
 * (If the end user's browser does not support 3d transform, it fallbacks to 2d transform.)
 *
 * @param element - The element to transform.
 * @param query
 * @param query.x - The X value of translate query.
 * @param query.y - The Y value of translate query.
 * @param query.use3d - Whether to use 3d transform.
 */
export function setTranslate(
  element: HTMLElement,
  { x = 0, y = 0, use3d = false }: TranslateQuery,
): void {
  if (use3d && supports3dTransform) {
    element.style[transformProperty] = `translate3d(${x}px, ${y}px, 0px)`;
  } else {
    element.style[transformProperty] = `translate(${x}px, ${y}px)`;
  }
}

/**
 * Set CSS transition value of an element.
 *
 * @param element - The element to modify.
 * @param value - The value for CSS transition property.
 */
export function setTransition(element: HTMLElement, value: string): void {
  element.style[transitionProperty] = value;
}
