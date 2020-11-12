/**
 * @overview
 * Slides stand for innermost elements of the carousel; each of them consists
 * of content that can be toggled visible/hidden on demand.
 *
 * Slides are defined by the child elements inside the container provided
 * to the constructor function of `Kineto` class.
 */

import {
  addClass,
  appendElementTree,
  createElement,
  delegateEvent,
  getAllElements,
  getElement,
  getElementIndex,
  getSize,
  hasClass,
  insertElementTreeNth,
  last,
  modulo,
  newArray,
  toCSSValue,
  toggleClass,
  removeAttributes,
  removeClass,
  resetSize,
  setAttributes,
  setStyles,
} from 'helpers';
import type { KinetoInterface, Options, SlideLoopQuery } from 'typings';
import { HeightOption } from 'typings';

/**
 * Prepare the slides.
 *
 * @this kineto - Current Kineto instance.
 */
function init(this: KinetoInterface): void {
  const { classNames, container, currentIndex, slide } = this;
  // Find the slide elements in the DOM.
  const elements = getAllElements(container.element.children);
  if (!elements.length) {
    throw new Error(`Container must have child elements representing slides.`);
  }
  slide.elements = elements;
  // Shorten length
  slide.length = elements.length;
  // Cache current style so we can revert it later
  slide.initialStyles = elements.map(element => element.getAttribute('style'));
  // Cache first slide's CSS class so that `add` function can mimic it later on.
  slide.classNameTemplate = elements[0].className;
  // Add CSS class & static style attributes
  elements.forEach(element => {
    addClass(element, classNames.slide);
    element.style.position = 'absolute';
  });
  slide.updateCurrent(currentIndex);
}

/**
 * Reset changes made while creating the component.
 *
 * @this kineto - Current Kineto instance.
 */
function destroy(this: KinetoInterface): void {
  const { classNames, slide } = this;
  const { elements, initialStyles, removeListener } = slide;
  // Remove DOM event listeners
  removeListener && removeListener();
  // Remove attributes back
  elements.forEach((element, index) => {
    // Classes
    removeClass(element, classNames.slide);
    removeClass(element, classNames.slideActive);
    removeClass(element, classNames.slideVisible);
    // Style attribute
    const initialStyle = initialStyles[index];
    if (initialStyle) {
      element.setAttribute('style', initialStyle);
    } else {
      element.removeAttribute('style');
    }
    // Accessibility attributes
    removeAttributes(element, ['aria-hidden', 'tabindex']);
  });
  // Clear data
  delete slide.elements;
  delete slide.length;
  delete slide.initialStyles;
  delete slide.classNameTemplate;
  delete slide.loopMatrix;
  delete slide.sizes;
  delete slide.heights;
  delete slide.maxHeight;
  delete slide.anchors;
  delete slide.offsets;
  delete slide.positions;
  delete slide.totalSize;
  delete slide.spacePerSlide;
  delete slide.visibleIndice;
  delete slide.whollyVisibleIndice;
  delete slide.loopBackward;
  delete slide.loopForeward;
  delete slide.removeListener;
}

/**
 * Update settings of the slides based on the current options. Any changes
 * that should be made after options
 *
 * @this kineto - Current Kineto instance.
 * @param nextOptions - Changed new options.
 */
function config(this: KinetoInterface, nextOptions: Options): void {
  const { container, classNames, slide } = this;
  const usesSwipe = nextOptions.touchSwipe || nextOptions.mouseSwipe;
  if (nextOptions.moveOnClick && !usesSwipe) {
    slide.removeListener =
      slide.removeListener ||
      delegateEvent({
        root: container.element,
        delegate: `.${classNames.slide}`,
        type: 'click',
        listener: slide.handleClick as EventListener,
      });
  } else {
    slide.removeListener && slide.removeListener();
    slide.removeListener = null;
  }
}

/**
 * Define width and height of the slides. Example of what should be size
 * (dimension along the main axis) of the slides and the container:
 *
 * mode       | perView | container size                            | slide size
 * -----------|---------|-------------------------------------------|-----------------------------------------------------
 * horizontal | auto    | container.width                           | slide.width
 * horizontal | number  | container.width                           | (container.width - margin * (perView - 1)) / perView
 * vertical   | auto    | predefined by CSS                         | slide.height
 * vertical   | number  | predefined by CSS                         | (container.height - margin * (perView - 1)) / perView
 * vertical   | auto    | 0 -> slide.maxHeight + margin             | slide.height
 * vertical   | number  | 0 -> (slide.maxHeight + margin) * perView | slide.height
 *
 * @this kineto - Current Kineto instance.
 */
function measure(this: KinetoInterface): void {
  const {
    alignFactor,
    container,
    isInit,
    isVertical,
    options: { margin, perView },
    slide,
  } = this;
  const forcedSize =
    perView !== 'auto' &&
    container.size !== 0 &&
    (container.size - margin * (perView - 1)) / perView;
  let anchor = 0;
  let size: number;
  let offset: number;
  let position: number;
  const sizes: number[] = [];
  const heights: number[] = [];
  const anchors: number[] = [];
  const offsets: number[] = [];
  const positions: number[] = [];

  slide.elements.forEach((element, index) => {
    // Remove all previous modifications on resize
    if (isInit) {
      resetSize(element);
    }
    // Get original size of the slide
    const { height, width } = getSize(element);
    // Calculate values
    if (index !== 0) anchor += size + margin;
    size = forcedSize || (isVertical ? height : width);
    offset = size * alignFactor;
    position = anchor + offset;
    // Cache them
    sizes[index] = size;
    heights[index] = isVertical ? forcedSize || height : height;
    anchors[index] = anchor;
    offsets[index] = offset;
    positions[index] = position;
  });
  // Each slide size parallel to the main axis. (x => width, y => height)
  slide.sizes = sizes;
  // Heights are used to handle `height` option.
  slide.heights = heights;
  // Height of tallest slide
  slide.maxHeight = Math.max(...slide.heights);
  // Base point of the slide position
  slide.anchors = anchors;
  // Offset from the base point; this varies upon `align` option.
  slide.offsets = offsets;
  // Actual positions; correspond to `left` or `top` css property
  // in non-vertical/vertical modes respectively.
  slide.positions = positions;
  // Sum of all slide sizes and gaps
  slide.totalSize = last(slide.anchors) + last(slide.sizes) + margin;
}

/**
 * Re-assign height or width of the slides, depending on the carousel's flow.
 *
 * @this kineto - Current Kineto instance.
 */
function resize(this: KinetoInterface): void {
  const { container, isVertical, options, slide } = this;
  const { elements, maxHeight, sizes } = slide;
  const sizeProperty = isVertical ? 'height' : 'width';
  const equalHeights = !isVertical && options.height === HeightOption.Equal;
  const cssOptions = {
    percentBase: options.usePercent ? container.size : undefined,
    precision: options.cssPrecision,
  };
  elements.forEach((element, index) => {
    // Assign new style
    element.style[sizeProperty] = toCSSValue(sizes[index], cssOptions);
    if (equalHeights) element.style.height = `${maxHeight}px`;
  });
}

/**
 * Relocate slides to be adjacent to each other, and cover the whole visible area
 * of the `scope`, using the `slide.loopMatrix` values.
 *
 * @this kineto - Current Kineto instance.
 */
function reposition(this: KinetoInterface): void {
  const { container, isLooped, isVertical, options, scope, slide } = this;
  const { anchors, elements, loopMatrix } = slide;
  const cssOptions = {
    percentBase: options.usePercent ? container.size : undefined,
    precision: options.cssPrecision,
  };
  let position;
  elements.forEach((element, index) => {
    position = anchors[index];
    if (isLooped) {
      position += loopMatrix[index] * scope.range;
    }
    position = toCSSValue(position, cssOptions);
    if (isVertical) {
      setStyles(element, { top: position, left: '' });
    } else {
      setStyles(element, { top: '', left: position });
    }
  });
}

/**
 * Add a new slide, with content, at the index given.
 *
 * @this kineto - Current Kineto instance.
 * @param content - HTML string representing content of the new slide.
 * @param index - The index at which the new slide should be inserted.
 *   If not specified, it will be added at the end.
 */
function add(this: KinetoInterface, content: string, index?: number): void {
  const { classNames, scope, slide } = this;
  const newSlide = createElement('div', {
    class: `${classNames.slide} ${slide.classNameTemplate}`,
    style: 'position: absolute;',
  });
  if (content) {
    newSlide.innerHTML = content;
  }
  if (typeof index === 'undefined') {
    appendElementTree(newSlide, scope.element);
    slide.elements.push(newSlide);
  } else {
    insertElementTreeNth(newSlide, scope.element, index);
    slide.elements.splice(index, 0, newSlide);
  }
  slide.length += 1;
}

/**
 * Remove an existinag slide at the index given.
 *
 * @this kineto - Current Kineto instance.
 * @param index - The index at which to remove slides.
 * @param deleteCount - The number of slides to remove from `start`.
 */
function remove(this: KinetoInterface, index = -1, deleteCount: 1): void {
  const { slide } = this;
  const removedSlides = slide.elements.splice(index, deleteCount);
  // TODO: replace with -> detachElement(removedSlide)
  removedSlides.forEach(removedSlide => {
    removedSlide.parentNode.removeChild(removedSlide);
    slide.length -= 1;
  });
}

/**
 * Find out which of the slides are loopable.
 *
 * @this kineto - Current Kineto instance.
 */
function setupLoop(this: KinetoInterface): void {
  const { container, isLooped, scope, slide } = this;
  // Skip if unnecessary
  if (!isLooped) {
    return;
  }
  const { length, sizes } = slide;
  const indiceBefore = [];
  const indiceAfter = [];
  // Each range represents empty space on each edges
  // that needs to be filled with looped slides.
  let rangeBefore = container.offset;
  let rangeAfter = container.size - container.offset;
  let i = length - 1;
  let j = 0;
  // Loop slides before the first slide
  while (i && rangeBefore > 0) {
    indiceBefore.push(i);
    rangeBefore -= sizes[i];
    i -= 1;
  }
  // Loop slides after the last slide
  while (j < slide.length && rangeAfter > 0) {
    indiceAfter.push(j);
    rangeAfter -= sizes[j];
    j += 1;
  }
  // Loop directions of each slide.
  // -1: loop before the first slide
  //  1: loop after the last slide
  slide.loopMatrix = newArray(slide.length, 0);
  // Slides to loop before the first one
  slide.loopBackward = {
    factor: -1,
    // Indice of the slides
    indice: indiceBefore,
    // Translate point before which slides should loop backward
    range: container.offset,
  };
  // Slides to loop after the last one
  slide.loopForeward = {
    factor: 1,
    // Indice of the slides
    indice: indiceAfter,
    // Translate point after which slides should loop backward
    range: container.size - container.offset - scope.range,
  };
}

/**
 * Indicate current slide with a CSS class; this function is invoked
 * before sliding animations occur.
 *
 * @this kineto - Current Kineto instance.
 * @param currentIndex - Currently active index.
 * @param previousIndex - Previously active index.
 */
function updateCurrent(
  this: KinetoInterface,
  currentIndex: number,
  previousIndex?: number,
): void {
  const { classNames, slide } = this;
  const activeClassName = classNames.slideActive;
  if (typeof previousIndex === 'number') {
    removeClass(slide.elements[previousIndex], activeClassName);
    addClass(slide.elements[currentIndex], activeClassName);
  } else {
    slide.elements.forEach((element, index) => {
      if (index === currentIndex) {
        addClass(element, activeClassName);
      } else {
        removeClass(element, activeClassName);
      }
    });
  }
}

/**
 * Indicate visible slides with a CSS class; this function is invoked
 * at the last phase of `kineto.refresh()` process.
 *
 * @this kineto - Current Kineto instance.
 */
function updateVisibility(this: KinetoInterface): void {
  const { classNames, container, isLooped, options, scope, slide } = this;
  // Get the visible range
  let rangeStart = (scope.translate + container.offset) * -1;
  let rangeEnd = rangeStart + container.size;
  if (isLooped) {
    rangeStart = modulo(rangeStart, scope.range);
    rangeEnd = modulo(rangeEnd, scope.range);
  }
  // Indicate visible slides
  slide.elements.forEach((element, index) => {
    const slideStart = slide.anchors[index];
    const slideEnd = slideStart + slide.sizes[index];
    let isVisible: boolean;
    if (isLooped && rangeStart > rangeEnd) {
      isVisible =
        (rangeStart <= slideStart || slideStart <= rangeEnd) &&
        (slideEnd <= scope.range || slideEnd <= rangeEnd);
    } else {
      isVisible = rangeStart <= slideStart && slideEnd <= rangeEnd;
    }
    // isVisible && console.debug(`Index ${index} is visible.`);
    // Toggle CSS class
    toggleClass(element, classNames.slideVisible, isVisible);
    // Toggle accessibility attributes
    if (options.aria) {
      setAttributes(element, {
        'aria-hidden': !isVisible,
        tabindex: isVisible ? 0 : -1,
      });
    } else {
      removeAttributes(element, ['aria-hidden', 'tabindex']);
    }
  });
}

/**
 * Memoize the loop matrix — data telling which slide(s) should be
 * looped in which direction. This data will be applied to actual positionning
 * of the slides during `slide.reposition()` process.
 *
 * @this kineto - Current Kineto instance.
 * @param query
 * @param query.translate - The translate value of the scope. The function
 *   decides whether to loop a slide or not to based on this value.
 */
function updateLoop(
  this: KinetoInterface,
  { translate }: { translate: number },
): void {
  const { slide } = this;
  const { loopBackward, loopForeward, loopMatrix, sizes } = slide;
  let hasUpdate = false;
  const updateMatrix = ({ factor, indice, range }: SlideLoopQuery) => {
    let remainingRange = range - translate * factor;
    indice.forEach(index => {
      const value = loopMatrix[index];
      const nextValue = remainingRange > 0 ? factor : 0;
      if (value !== nextValue) {
        loopMatrix[index] = nextValue;
        hasUpdate = true;
      }
      remainingRange -= sizes[index];
    });
  };
  updateMatrix(loopBackward);
  updateMatrix(loopForeward);
  if (hasUpdate) {
    slide.reposition();
  }
}

/**
 * Callback to execute when a slide is clicked. This handler is attached
 * when `moveOnClick` option is set.
 *
 * @this kineto - Current Kineto instance.
 * @param event - MouseEvent created by clicking on a slide.
 */
function handleClick(this: KinetoInterface, { target }: MouseEvent): void {
  const { classNames } = this;
  const targetIsSlide =
    hasClass(target as HTMLElement, classNames.slide) ||
    !!getElement(classNames.slide, target as HTMLElement);
  if (targetIsSlide) {
    const index = getElementIndex(target as HTMLElement);
    this.goTo(index);
  }
  this.emit('interacted');
}

/**
 * Handler for slide length change event.
 */
function handleLengthChange(this: KinetoInterface): void {
  const { currentIndex, slide } = this;
  slide.updateVisibility();
  slide.updateCurrent(currentIndex);
}

export default {
  name: 'slide',
  init,
  destroy,
  bind: {
    measure,
    resize,
    reposition,
    add,
    remove,
    setupLoop,
    updateCurrent,
    updateVisibility,
    updateLoop,
    handleClick, // swipe component uses this
  },
  on: {
    config,
    change: updateCurrent,
    changed: updateVisibility,
    lengthchanged: handleLengthChange,
    refresh: updateVisibility,
  },
};
