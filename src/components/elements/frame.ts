/**
 * @overview
 * Frame stands for the inner container element that holds the main carousel.
 * The frame element is dynamically created during `init` process, and is removed
 * by `destroy` process.
 */

import { addClass, createElement } from 'helpers';
import type { KinetoInterface, Options } from 'typings';
import { HeightOption } from 'typings';

/**
 * Prepare the frame.
 *
 * @this kineto - Current Kineto instance.
 */
function init(this: KinetoInterface): void {
  const { classNames, frame } = this;
  // Read element and make basic modifications
  const element = createElement('div');
  addClass(element, classNames.frame);
  element.style.overflow = 'hidden';
  // Set initial values
  frame.element = element;
}

/**
 * Reset changes made while creating the component.
 *
 * @this kineto - Current Kineto instance.
 */
function destroy(this: KinetoInterface): void {
  const { frame } = this;
  // Revert styles back
  delete frame.element;
  delete frame.height;
}

/**
 * Update settings of the frame based on the current options. Any changes
 * that should be made after options
 *
 * @this kineto - Current Kineto instance.
 * @param nextOptions - Changed new options.
 * @param currentOptions - Old options before being changed.
 */
function config(
  this: KinetoInterface,
  nextOptions: Options,
  currentOptions: Options,
): void {
  const { frame, options } = this;
  if (!currentOptions || nextOptions.height !== currentOptions.height) {
    // Adapt frame height on change
    if (options.height === HeightOption.Adaptive) {
      this.on('change', frame.resize);
    } else {
      this.off('change', frame.resize);
    }
  }
}

/**
 * Re-assign height of the frame. The way the height is calculated depends on
 * the value of `height` and `mode` options.
 *
 * @this kineto - Current Kineto instance.
 */
function resize(this: KinetoInterface): void {
  const { frame, container, currentIndex, isVertical, options, slide } = this;
  if (isVertical) {
    frame.height = container.size;
  } else if (options.height === HeightOption.Adaptive) {
    frame.height = slide.heights[currentIndex];
  } else {
    frame.height = slide.maxHeight;
  }
  frame.element.style.height = `${frame.height}px`;
}

export default {
  name: 'frame',
  init,
  destroy,
  bind: {
    resize,
  },
  on: {
    config,
  },
};
