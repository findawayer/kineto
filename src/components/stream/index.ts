/**
 * @overview
 * Stream component implements automatic rotation of slides in foreward direction.
 *
 * Although it is activated only if the value of `streamEvery` option is truthy,
 * it is mounted to all Kineto instances regardless, to support possible `play` request`
 * via global API.
 *
 * It interacts with PageVisibility API of end user's browser (if supported)
 * and pauses the stream while the document gets invisible (inactive tab or browser, etc).
 */

import { addEvent, every, isInElementTree } from 'helpers';
import type { KinetoInterface } from 'typings';
import { getInstanceById, getSyncedIds } from 'store';

let removeDynamicListener: () => unknown;

/**
 * Initialize the component.
 *
 * @this kineto - Current Kineto instance.
 */
function init(this: KinetoInterface): void {
  const { container, options, stream, syncId } = this;
  // Avoid duplicate call
  if (stream.isInit) {
    return;
  }
  // Set initial values
  stream.isInit = true;
  stream.isActive = false;
  stream.timeoutId = null;
  // Bind events
  stream.removeListeners = [];
  if (options.pauseOnHover) {
    stream.removeListeners.push(
      addEvent({
        target: container.element,
        type: 'mouseenter',
        listener: stream.pause as EventListener,
      }),
    );
    stream.removeListeners.push(
      addEvent({
        target: container.element,
        type: 'mouseleave',
        listener: stream.resume as EventListener,
      }),
    );
  }
  // Start streaming if
  // 1. streaming is requested (the component is mounted regardless)
  // 2. no other instance is in sync (sync store will trigger the stream)
  if (options.stream && !syncId) {
    stream.play();
  }
}

/**
 * Reset changes made while creating the component.
 *
 * @this kineto - Current Kineto instance.
 */
function destroy(this: KinetoInterface): void {
  const { stream } = this;
  // Avoid duplicate call
  if (!stream.isInit) {
    return;
  }
  // Pause active stream
  stream.pause();
  // Remove DOM event listeners
  if (stream.removeListeners) {
    stream.removeListeners.forEach(remove => remove());
  }
  if (removeDynamicListener) {
    removeDynamicListener();
    removeDynamicListener = null;
  }
  // Clear data
  stream.isInit = false;
  stream.isActive = false;
  delete stream.timeoutId;
  delete stream.removeListeners;
}

/**
 * Start moving forward periodically.
 *
 * @this kineto - Current Kineto instance.
 */
function play(this: KinetoInterface): void {
  const { options, stream } = this;
  // Prevent duplicate call & stream with no delay
  if (stream.isActive || !options.streamEvery) {
    return;
  }
  stream.isActive = true;
  stream.timeoutId = window.setTimeout(tick.bind(this), options.streamEvery);
  this.addStateClass('playing');
}

/**
 * Stop the auto movement.
 *
 * @this kineto - Current Kineto instance.
 * @param options
 * @param options.passive - Flag telling the execution is ordered by the global store,
 *   to prevent infinite event loops. Do NOT use this option outside the store.
 */
function pause(
  this: KinetoInterface,
  { passive }: { passive?: boolean } = {},
): void {
  const { stream } = this;
  // `pause` event sends a signal to other instances in sync.
  // (`passive` option is used to prevent infinite event loops in sync mode.)
  if (!passive) {
    this.emit('pause');
    // Clicking outside will resume the stream. This should be put at the end
    // of the call stack, otherwise it would trigger immediately on `interact`.
    if (!removeDynamicListener) {
      removeDynamicListener = addEvent({
        target: document,
        type: 'click',
        listener: handleBlur.bind(this),
      });
    }
  }
  if (stream.isActive) {
    clearTimeout(stream.timeoutId);
    stream.isActive = false;
    this.removeStateClass('playing');
  }
}

/**
 * Restart the auto movement once paused.
 *
 * @this kineto - Current Kineto instance.
 * @param options
 * @param options.passive - Flag telling the execution is ordered by the global store,
 *   to prevent infinite event loops. Do NOT use this option outside the store.
 */
function resume(
  this: KinetoInterface,
  { passive }: { passive?: boolean } = {},
): void {
  const { options, stream, syncId } = this;
  // `resume` event sends a signal to other instances in sync.
  if (!passive) {
    this.emit('resume');
  }
  // Clear handleBlur event listener added in `pause()` process.
  if (removeDynamicListener) {
    removeDynamicListener();
    removeDynamicListener = null;
  }
  // passive
  if (options.stream || syncId) {
    stream.play();
  }
}

/**
 * Move the carousel foreward. This function is invoked while the stream is active,
 * at the time interval defined by `streamEvery` option.
 *
 * @this kineto - Current Kineto instance.
 */
function tick(this: KinetoInterface): void {
  const { options, stream } = this;
  if (!stream.isActive) {
    return;
  }
  if (!options.streamRewind && !this.hasNextSlide()) {
    stream.pause();
    return;
  }
  this.next({ rewind: true });
  // Prevent stream with no delay
  if (options.streamEvery) {
    stream.timeoutId = window.setTimeout(tick.bind(this), options.streamEvery);
  }
}

/**
 * Restart the stream, once paused by clicking/hovering on the carousel,
 * when the user removes the pointer off.
 *
 * @example
 *   - Paused by `mousedown` event when `pauseOnClick` option is set,
 *     resumed by clicking outside the carousel.
 *   - The same applies to `pauseOnHover` case.
 *
 * @this kineto - Current Kineto instance.
 */
function handleBlur(event: Event): void {
  const target = event.target as HTMLElement;
  const { container, stream, syncId } = this;
  if (syncId) {
    const syncedIds = getSyncedIds(this);
    const isOffBounds = every(syncedIds, id => {
      const { container } = getInstanceById(id);
      return !isInElementTree(target, container.element);
    });
    if (isOffBounds) {
      const syncBase = getInstanceById(syncedIds[0]);
      syncBase.resume();
    }
  } else if (!isInElementTree(target, container.element)) {
    stream.resume();
  }
  event.stopPropagation();
}

export default {
  name: 'stream',
  init,
  destroy,
  bind: {
    destroy,
    play,
    pause,
    resume,
  },
  on: {
    interact: pause,
    interacted: resume,
    lengthchange: pause,
    lengthchanged: resume,
  },
};
