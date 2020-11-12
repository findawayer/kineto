/**
 * @overview
 * Scope stands for the innermost container element that holds slide elements.
 * It delimits visible part of the carousel and implements the sliding effect:
 * moving from a slide to another is achieved by updating CSS translate value
 * of the scope in the reverse direction to that of the movement.
 */

import {
  clamp,
  createElement,
  first,
  last,
  modulo,
  setStyles,
  setTranslate,
  setTransition,
} from 'helpers';
import { AlignOption } from 'typings';
import type { KinetoInterface, ScopeRenderQuery } from 'typings';

/**
 * Prepare the scope.
 *
 * @this kineto - Current Kineto instance.
 */
function init(this: KinetoInterface): void {
  const { classNames, scope } = this;
  // Read element and make basic modifications
  const element = createElement('div', { class: classNames.scope });
  setStyles(element, { position: 'relative', width: '100%', height: '100%' });
  setTransition(element, 'none 0s ease 0s');
  // Set initial values
  scope.element = element;
}

/**
 * Reset changes made while creating the component.
 *
 * @this kineto - Current Kineto instance.
 */
function destroy(this: KinetoInterface): void {
  const { scope } = this;
  // Clear data
  delete scope.element;
  delete scope.range;
  delete scope.translate;
  delete scope.maxTranslate;
  delete scope.minTranslate;
  delete scope.snap;
}

/**
 * Set CSS translate of the scope to match current index. This method is for
 * static rendering only, use `render()` directly when the scope is in movement.
 *
 * @this kineto - Current Kineto instance.
 */
function reposition(this: KinetoInterface): void {
  const { currentIndex, scope } = this;
  const translate = scope.snap[currentIndex];
  scope.render({ translate });
}

/**
 * Apply `translate` value passed to the scope, as CSS translate declaration.
 * This function also makes slides wrap around the edges, if the layout is looped.
 *
 * @this kineto - Current Kineto instance.
 * @param query
 * @param query.translate - Current translate of the scope. (requires modulo)
 * @param query.use3d - Use 3d translate declaration for hardware acceleration.
 *   When the movement is finished, it is better to use 2d translate instead,
 *   to prevent blurry text rendering in some browsers.
 */
function render(
  this: KinetoInterface,
  { translate, isAnimating }: ScopeRenderQuery,
): void {
  const { container, isLooped, isVertical, scope, slide } = this;
  const loopedTranslate = isLooped
    ? modulo(translate, scope.range) - scope.range
    : translate;
  // Update translate data. We should round this value within the scope's range
  // when an animation is complete, because `swipe` component sometimes provide
  // off-range values.
  scope.translate = isAnimating ? translate : loopedTranslate;
  // Update CSS translate of the scope element
  setTranslate(scope.element, {
    [isVertical ? 'y' : 'x']: loopedTranslate + container.offset,
    use3d: isAnimating,
  });
  // In a looped layout, wrap around slides on edges
  if (isLooped) {
    slide.updateLoop({ translate: loopedTranslate });
  }
}

/**
 * Memoize values related to the scope's positionning, using previously measured
 * dimension of the container and the slides.
 *
 * @this kineto - Current Kineto instance.
 */
function setupMatrix(this: KinetoInterface): void {
  const {
    container,
    scope,
    slide,
    options: { align, margin },
  } = this;
  const isJustified = align === AlignOption.Justify;
  let min: number;
  let max: number;
  // Range of scope (= size of the scope)
  scope.range = slide.totalSize;
  // Minimum and maximum values that the translate can reach
  if (isJustified) {
    max = container.offset;
    min = scope.range - container.size + container.offset - margin;
  } else {
    max = first(slide.positions);
    min = last(slide.positions);
  }
  max *= -1;
  min *= -1;
  scope.maxTranslate = max;
  scope.minTranslate = min;
  // Breakpoints of the scope that snatches to the positioning of slides
  scope.snap = slide.positions.map(position => {
    const translate = position * -1;
    return isJustified ? clamp(translate, min, max) : translate;
  });
}

export default {
  name: 'scope',
  init,
  destroy,
  bind: {
    reposition,
    render,
    setupMatrix,
  },
};
