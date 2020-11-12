/**
 * @overview
 * Pagination stands for a group of buttons representing a shortcut to related slide.
 * Kineto generates the same number of buttons a s the number of slides, when the value of
 * `pagination` option is set.
 */

import {
  appendElementTree,
  createElement,
  delegateEvent,
  detachElement,
  emptyElement,
  getElementIndex,
  newArray,
  toggleClass,
} from 'helpers';
import type { ClassNames, KinetoInterface } from 'typings';

/**
 * Initialize the component.
 *
 * @this kineto - Current Kineto instance.
 */
function init(this: KinetoInterface): void {
  const { classNames, container, options, pagination } = this;
  // Create elements
  const wrapper = createElement('div', { class: classNames.pagination });
  pagination.element = { wrapper, buttons: [] };
  // Add aria attributes
  if (options.aria) {
    wrapper.setAttribute('aria-hidden', 'true');
  }
  // Listen to user's click action
  pagination.removeListener = delegateEvent({
    root: wrapper,
    delegate: `.${classNames.paginationButton}`,
    type: 'click',
    listener: (_, delegateTarget) => {
      const index = getElementIndex(delegateTarget);
      this.goTo(index);
      this.emit('interact');
    },
  });
  // Create pagination based on slide length & set active dot
  pagination.updateLength();
  // Insert the elements into the DOM
  const elementContext = options.paginationInto || container.element;
  appendElementTree(wrapper, elementContext);
}

/**
 * Reset changes made while creating the component.
 *
 * @this kineto - Current Kineto instance.
 */
function destroy(this: KinetoInterface): void {
  const { pagination } = this;
  // Unbind listener
  pagination.removeListener();
  // Remove the element tree from DOM
  detachElement(pagination.element.wrapper);
  // Clear data
  delete pagination.element;
  delete pagination.removeListener;
}

/**
 * Update highlighted button to match current index.
 *
 * @this kineto - Current Kineto instance.
 */
function updateCurrent(this: KinetoInterface, currentIndex: number): void {
  const { classNames, pagination } = this;
  pagination.element.buttons.forEach((button, index) => {
    const isCurrent = index === currentIndex;
    toggleClass(button, classNames.paginationButtonActive, isCurrent);
  });
}

/**
 * Update the number of buttons to match the number of slides, when internal
 * `lengthchange` event occurs.
 *
 * @this kineto - Current Kineto instance.
 */
function updateLength(this: KinetoInterface): void {
  const { classNames, currentIndex, options, pagination, slide } = this;
  const { buttons, wrapper } = pagination.element;
  // We prefer to remove all existing buttons and re-create them from scratch,
  // rather than adjusting content of the buttons (they may need to update) to:
  // 1. keep the transparency of process
  // 2. make it more performant
  if (buttons) {
    emptyElement(wrapper);
  }
  // Create buttons
  pagination.element.buttons = newArray(slide.length).map((_, index) => {
    const button = createButton({
      index,
      classNames,
      content: options.paginationTemplate,
    });
    wrapper.appendChild(button);
    return button;
  });
  // Update current index
  pagination.updateCurrent(currentIndex);
}

/**
 * Create a single pagination button.
 *
 * @param query
 * @param query.index - Index of the button(may be used to the text content).
 * @param query.classNames - Map of classNames of the current instance.
 * @param query.content - HTML string to insert as the button's content.
 */
function createButton({
  index,
  classNames,
  content,
}: {
  index: number;
  classNames: ClassNames;
  content: string;
}) {
  const button = createElement('button', {
    type: 'button',
    class: classNames.paginationButton,
    'aria-hidden': 'true',
  });
  if (content) {
    button.innerHTML = content.replace(/{{index}}/g, (index + 1).toString());
  } else {
    const span = createElement('span', {
      class: classNames.paginationButtonText,
    });
    span.textContent = (index + 1).toString();
    button.appendChild(span);
  }
  return button as HTMLButtonElement;
}

export default {
  name: 'pagination',
  test: 'pagination',
  init,
  destroy,
  bind: {
    updateCurrent,
    updateLength,
  },
  on: {
    change: updateCurrent,
    lengthchanged: updateLength,
  },
};
