import {
  appendElementTree,
  camelToPascal,
  createElement,
  createSVGElement,
  delegateEvent,
  detachElement,
  hasClass,
  toggleClass,
} from 'helpers';
import type { ClassNames, KinetoInterface, Options } from 'typings';

/**
 * Prepare the component.
 *
 * @this kineto - Current Kineto instance.
 */
function init(this: KinetoInterface): void {
  const { arrows, classNames, container, currentIndex, options } = this;
  // Create elements
  const wrapper = createElement('div', { class: classNames.arrows });
  options.aria && wrapper.setAttribute('aria-hidden', 'true');
  const previous = createButton({ type: 'previous', classNames, options });
  const next = createButton({ type: 'next', classNames, options });
  wrapper.appendChild(previous);
  wrapper.appendChild(next);
  // Set initial values
  arrows.element = { wrapper, previous, next };
  arrows.previousDisabled = false;
  arrows.nextDisabled = false;
  // Listen to user's click action
  arrows.removeListener = delegateEvent({
    root: wrapper,
    delegate: `.${classNames.arrowsButton}`,
    type: 'click',
    listener: handleClick.bind(this),
  });
  // Insert the elements into the DOM
  const elementContext = options.arrowsInto || container.element;
  appendElementTree(wrapper, elementContext);
  arrows.update(currentIndex);
}

/**
 * Reset changes made while creating the component.
 *
 * @this kineto - Current Kineto instance.
 */
function destroy(this: KinetoInterface): void {
  const { arrows } = this;
  // Remove DOM event listeners
  arrows.removeListener();
  // Remove the element tree from DOM
  detachElement(arrows.element.wrapper);
  // Clear data
  delete arrows.element;
  delete arrows.previousDisabled;
  delete arrows.nextDisabled;
}

/**
 * Update enabled/disabled state of the arrows, based on current index.
 *
 * @this kineto - Current Kineto instance.
 * @param currentIndex - Destination index of the movement.
 */
function update(this: KinetoInterface, currentIndex: number): void {
  const { arrows, classNames } = this;
  const {
    element: { previous, next },
  } = arrows;
  const previousDisabled = !this.hasPreviousSlide(currentIndex);
  const nextDisabled = !this.hasNextSlide(currentIndex);
  if (previousDisabled !== arrows.previousDisabled) {
    arrows.previousDisabled = previousDisabled;
    previous.disabled = previousDisabled;
    toggleClass(previous, classNames.arrowsButtonDisabled, previousDisabled);
  }
  if (nextDisabled !== arrows.nextDisabled) {
    arrows.nextDisabled = nextDisabled;
    next.disabled = nextDisabled;
    toggleClass(next, classNames.arrowsButtonDisabled, nextDisabled);
  }
}

/**
 * Create a single arrow button element.
 *
 * @param query
 * @param query.type - Direction identifier of the button.
 * @param query.classNames - `classNames` data of the instance.
 * @param query.options - `options` data of the instance.
 */
function createButton({
  type,
  classNames,
  options,
}: {
  type: 'previous' | 'next';
  classNames: ClassNames;
  options: Options;
}): HTMLButtonElement {
  const { arrowTemplate, aria } = options;
  // Create button element
  const button = createElement<HTMLButtonElement>('button', {
    type: 'button',
    class: `${classNames.arrowsButton} ${
      classNames[`arrowsButton${camelToPascal(type)}`]
    }`,
  });
  if (arrowTemplate && Array.isArray(arrowTemplate)) {
    const index = type === 'previous' ? 0 : 1;
    const template = arrowTemplate[index];
    button.innerHTML = template;
  } else {
    // Create vector icon
    const svg = createSVGElement('svg', {
      class: classNames.arrowsIcon,
      viewBox: '0 0 100 100',
    });
    const path = createSVGElement('polyline', {
      points: '35 10,75 50,35 90',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': 8,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    });
    // Flip the icon horizontally, if the button is of `previous` type
    if (type === 'previous') {
      path.setAttribute('transform', 'translate(100, 100) rotate(-180)');
    }
    // Structure the element tree
    svg.appendChild(path);
    button.appendChild(svg);
  }
  // Add aria attribute
  if (aria) {
    button.setAttribute('aria-hidden', 'true');
  }
  // Return the root element
  return button;
}

/**
 * Callback to fire on clicking on a button.
 *
 * @param _ - The mouse event.
 * @param button - The clicked button.
 */
function handleClick(
  this: KinetoInterface,
  _: Event,
  button: HTMLElement,
): void {
  const { classNames } = this;
  if (hasClass(button, classNames.arrowsButtonPrevious)) {
    this.previous();
  } else {
    this.next();
  }
  this.emit('interact');
}

export default {
  name: 'arrows',
  test: 'arrows',
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
