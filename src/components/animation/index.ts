import type { AnimationStartQuery, KinetoInterface } from 'typings';
import { isNumber } from 'helpers';
import { getEasingFunction } from 'core/options';

/**
 * Prepare the component.
 *
 * @this kineto - Current Kineto instance.
 */
function init(this: KinetoInterface): void {
  const { animation } = this;
  animation.isActive = false;
  animation.hasPath = false;
}

/**
 * Reset changes made while creating the component.
 *
 * @this kineto - Current Kineto instance.
 */
function destroy(this: KinetoInterface): void {
  const { animation } = this;
  // Stop animation
  if (animation.frameId) {
    cancelAnimationFrame(animation.frameId);
  }
  // Remove CSS state class
  this.removeStateClass('animating');
  // Clear data
  delete animation.isActive;
  delete animation.hasPath;
  delete animation.duration;
  delete animation.easing;
  delete animation.tick;
  delete animation.frameId;
  delete animation.startTime;
  delete animation.from;
  delete animation.to;
}

/**
 * Watch frame updates using `requestAnimationFrame`.
 *
 * @this kineto - Current kineto instance.
 * @param query
 * @param query.targetIndex - Destination index if any.
 * @param query.tick - Frame rendering function.
 * @param query.duration - Duration of the animation in miliseconds.
 * @param query.easing - The progress curve of the animation.
 * @param query.onComplete - Callback to invoke on animation completion.
 */
function start(
  this: KinetoInterface,
  {
    targetTranslate,
    tick = update.bind(this),
    duration = this.options.speed,
    easing = this.options.easing,
  }: AnimationStartQuery,
): void {
  const { animation, scope } = this;
  // Clear previous animation
  animation.stop();
  // Add state class
  this.addStateClass('animating');
  // Construct animation reference
  animation.tick = tick;
  animation.duration = duration;
  animation.easing = getEasingFunction(easing);
  animation.isActive = true;
  if (isNumber(targetTranslate)) {
    animation.hasPath = true;
    animation.from = scope.translate;
    animation.to = targetTranslate;
  }
  // Start repeating tick
  animation.frameId = requestAnimationFrame(now => {
    animation.startTime = now;
    requestAnimationFrame(animation.tick);
  });
}

/**
 * Stop watching frame updates and reset values.
 *
 * @this kineto - Current kineto instance.
 */
function stop(this: KinetoInterface): void {
  const { animation } = this;
  if (!animation.isActive) {
    return;
  }
  // Cancel ongoing `updateFrame`
  cancelAnimationFrame(animation.frameId);
  // Reset animation object
  animation.isActive = false;
  animation.hasPath = false;
  delete animation.from;
  delete animation.to;
  delete animation.duration;
  delete animation.easing;
  delete animation.tick;
  // Remove CSS state class
  this.removeStateClass('animating');
  this.emit('animatestop');
}

/**
 * Render out an animated frame; moving from a slide to another.
 * This is the default rendering function of our animation.
 *
 * @this kineto - Current kineto instance.
 * @param now - Current timestamp.
 */
function update(this: KinetoInterface, now: number): void {
  const { animation, scope } = this;
  const { from, to, tick, duration, easing, startTime } = animation;
  // Calculate next translate if animation path is set
  const elapsed = now - startTime;
  const progress = Math.min(elapsed / duration, 1);
  const translate = from + (to - from) * easing(progress);
  const isComplete = progress === 1;
  // Render this frame
  scope.render({ translate, isAnimating: !isComplete });
  // Continue calling the tick recursively until the progress hits 1
  if (isComplete) {
    this.emit('animated');
    animation.stop();
    return;
  }
  animation.frameId = requestAnimationFrame(tick);
}

export default {
  name: 'animation',
  init,
  destroy,
  bind: {
    start,
    stop,
  },
};
