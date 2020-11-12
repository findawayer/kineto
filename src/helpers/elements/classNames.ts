/**
 * Element.prototype.classList polyfill.
 * Source: https://github.com/react-bootstrap/dom-helpers | MIT License
 * - Drop SVG support.
 * - Add `force` parameter to `toggleClass`.
 * - Add `replaceClass` method.
 */

/**
 * Test if the `element` passed has a specific className.
 *
 * @param element - The element to test.
 * @param classToTest - The className the element is expected to have.
 */
export function hasClass(element: HTMLElement, classToTest: string): boolean {
  if (element.classList) {
    return !!classToTest && element.classList.contains(classToTest);
  }
  return ` ${element.className} `.indexOf(` ${classToTest} `) !== -1;
}

/**
 * Add a new className to the `element` passed.
 *
 * @param element - The element to assign the new className.
 * @param classToAdd - The className to add.
 */
export function addClass(element: HTMLElement, classToAdd: string): void {
  if (element.classList) {
    element.classList.add(classToAdd);
  } else if (!hasClass(element, classToAdd)) {
    element.className = element.className
      ? `${element.className} ${classToAdd}`
      : classToAdd;
  }
}

/**
 * Remove a single className from a className that might consist of multiple classes.
 *
 * @param originalClass - The className to modify.
 * @param classToRemove - The className to extract from the `originalClass` above.
 */
function replaceClass(originalClass: string, classToRemove: string): string {
  return originalClass
    .replace(new RegExp(`(^|\\s)${classToRemove}(?:\\s|$)`, 'g'), '$1')
    .replace(/\s+/g, ' ')
    .replace(/^\s*|\s*$/g, '');
}

/**
 * Remove an existing className from the `element` passed.
 *
 * @param element - The element to lose the className.
 * @param classToRemove - The className to remove.
 */
export function removeClass(element: HTMLElement, classToRemove: string): void {
  if (element.classList) {
    element.classList.remove(classToRemove);
  } else {
    element.className = replaceClass(element.className, classToRemove);
  }
}

/**
 * Flip the existance of a className from the `element` passed.
 * Add it if it didn't exist, remove if it existed.
 *
 * @param element - The element to modify.
 * @param classToToggle - The className to toggle.
 * @param force - Targeting state of the className's existance.
 */
export function toggleClass(
  element: HTMLElement,
  classToToggle: string,
  force?: boolean,
): void {
  if (element.classList) {
    element.classList.toggle(classToToggle, force);
  } else if (typeof force === 'boolean') {
    force
      ? addClass(element, classToToggle)
      : removeClass(element, classToToggle);
  } else {
    hasClass(element, classToToggle)
      ? removeClass(element, classToToggle)
      : addClass(element, classToToggle);
  }
}
