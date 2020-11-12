import { getElement } from 'helpers';
import type { BaseOptions } from 'typings';

/**
 * Options expecting either a HTML element or a element selector.
 * This will be normalized to the actual element in the DOM,
 * and be fall-backed to the container element.
 */
const elementOptions = ['arrowsInto', 'paginationInto', 'wheelTarget'];

/**
 * Try converting options containing element selectors to corresponding DOM element.
 * If no matching element found, assign `null` instead.
 *
 * @param {object} options - the options to test.
 */
function convertElements(options: BaseOptions): void {
  elementOptions.forEach(key => {
    if (options[key]) {
      const matchingElement = getElement(options[key]);
      options[key] = matchingElement;
      if (!matchingElement) {
        console.warn(
          `No element matching '${key}'; fallback to container element.`,
        );
      }
    }
  });
}

export { convertElements };
