import { appendElementTree, createElement, detachElement } from 'helpers';
import type { KinetoInterface } from 'typings';

/**
 * Prepare the component.
 *
 * @this kineto - Current Kineto instance.
 */
function init(this: KinetoInterface): void {
  const { classNames, container, count, currentIndex, options } = this;
  // Create elements
  const wrapper = createElement('div', { class: classNames.count });
  options.aria && wrapper.setAttribute('aria-hidden', 'true');
  count.element = wrapper;
  count.update(currentIndex);
  // Insert the elements into the DOM
  const elementContext = options.countInto || container.element;
  appendElementTree(wrapper, elementContext);
}

/**
 * Reset changes made while creating the component.
 *
 * @this kineto - Current Kineto instance.
 */
function destroy(this: KinetoInterface): void {
  const { count } = this;
  // Remove element from DOM
  detachElement(count.element);
  // Clear data
  delete count.element;
}

/**
 * Update text of the counter, based on current index.
 *
 * @this kineto - Current Kineto instance.
 * @param nextIndex - Destination index of the movement.
 */
function update(this: KinetoInterface, currentIndex: number): void {
  const { count, options, slide } = this;
  const current = (currentIndex + 1).toString();
  const total = slide.length.toString();
  if (options.countTemplate) {
    count.element.innerHTML = options.countTemplate
      .replace(/{{current}}/g, current)
      .replace(/{{total}}/g, total);
  } else {
    count.element.textContent = `${current}/${total}`;
  }
}

export default {
  name: 'count',
  test: 'count',
  init,
  destroy,
  bind: {
    update,
  },
  on: {
    change: update,
    lengthchanged: update,
  },
};
