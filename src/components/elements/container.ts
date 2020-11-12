/**
 * @overview
 * Container stands for the outmost layer of the carousel's element tree;
 * It holds the carousel along with elemental components like arrows, count, etc.
 *
 * The container element is specified by the initial `containerSelector`
 * provided as parameter of the constructor function of class `Kineto`.
 */

import { addClass, getSize, removeClass, resetSize } from 'helpers';
import type { KinetoInterface } from 'typings';

/**
 * Prepare the container.
 *
 * @this kineto - Current Kineto instance.
 */
function init(this: KinetoInterface): void {
  const { classNames, container, containerElement } = this;
  // Inherit container element value from the parent instance
  container.element = containerElement;
  // Cache current style attribute to be able to restore it later.
  container.initialStyle = container.element.getAttribute('style');
  // Add CSS class
  addClass(container.element, classNames.container);
}

/**
 * Reset changes made while creating the component.
 *
 * @this kineto - Current Kineto instance.
 */
function destroy(this: KinetoInterface): void {
  const { classNames, container } = this;
  const { element, initialStyle } = container;
  // Remove CSS class
  removeClass(element, classNames.container);
  // Revert styles back
  if (initialStyle) {
    element.setAttribute('style', initialStyle);
  } else {
    element.removeAttribute('style');
  }
  // Clear data
  delete container.element;
  delete container.initialStyle;
  delete container.height;
  delete container.size;
  delete container.offset;
}

/**
 * Compute width and height of the container.
 *
 * @this kineto - Current Kineto instance.
 */
function measure(this: KinetoInterface): void {
  const { alignFactor, container, frame, isInit, isVertical } = this;
  // Reset all modifications first
  if (isInit) {
    // Restore initial style attribute
    container.element.setAttribute('style', container.initialStyle);
    // Frame is dynamically created; just remove all size values.
    resetSize(frame.element);
  }
  const { width, height } = getSize(container.element);
  container.height = height;
  // `size` -> the dimension parallel to the carousel's flow.
  container.size = isVertical ? height : width;
  container.offset = container.size * alignFactor;
}

/**
 * Re-calculate size of the container for vertical layout. In a vertical layout,
 * the container's height can be mismeasured because of the absolute positionning
 * of the slides, unless set explicitely with CSS. We should figure out how tall
 * the container should be using the height of slides and `perView` option.
 *
 * @this kineto - Current Kineto instance.
 */
function resize(this: KinetoInterface): void {
  const {
    alignFactor,
    container,
    isVertical,
    options: { margin, perView },
    slide,
  } = this;
  if (!isVertical || container.size !== 0) {
    return;
  }
  const perViewFactor = perView === 'auto' ? 1 : perView;
  container.height =
    perViewFactor * slide.maxHeight + (Math.floor(perViewFactor) - 1) * margin;
  container.size = container.height;
  container.offset = container.size * alignFactor;
}

export default {
  name: 'container',
  init,
  destroy,
  bind: {
    measure,
    resize,
  },
};
