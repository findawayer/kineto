/**
 * @overview Polyfill for requestAnimationFrame & cancelAnimationFrame.
 *
 * orginal source: https://github.com/chrisdickinson/raf
 * @copyright 2013 Chris Dickinson <chris@neversaw.us>
 * https://github.com/chrisdickinson/raf/blob/master/LICENSE
 *
 * modified:
 * - Frame per 16ms instead of round(1000/60) to avoid fluctuation of frame rate.
 *   (@see: https://lists.webkit.org/pipermail/webkit-dev/2011-September/018095.html)
 * - Vendor prefix `webkit` is restored.
 * - Force use of polyfill in environments where request... is present with no way to cancel.
 */

import { now } from 'helpers';

// Trace of an animation frame
type AnimationFrameRef = {
  handle: number;
  callback: FrameRequestCallback;
  cancelled: boolean;
};

// global variable
const prefixes = ['moz', 'ms', 'webkit'];
let prefixedRequest: (callback: FrameRequestCallback) => number;
let prefixedCancel: (handle: number) => void;
let id: number;
let lastTime: number;
const queue: AnimationFrameRef[] = [];

// Find vendor-prefixed version
for (let i = 0, prefix; i < prefixes.length && !prefixedRequest; i += 1) {
  prefix = prefixes[i];
  prefixedRequest = window[`${prefix}RequestAnimationFrame`];
  prefixedCancel =
    window[`${prefix}CancelAnimationFrame`] ||
    window[`${prefix}CancelRequestAnimationFrame`];
}

// Polyfill for requestAnimationFrame
function emulateRequest(callback: FrameRequestCallback): number {
  if (!queue.length) {
    const currentTime = now();
    const timeToCall = Math.max(0, 16 - (currentTime - lastTime));
    lastTime = currentTime + timeToCall;
    setTimeout(function tick() {
      // Make a copy of the queue
      const $queue = queue.slice(0);
      let item;
      // Clear the queue to prevent callbacks from appending listeners
      // to the current frame's queue
      queue.length = 0;
      for (let i = 0; i < $queue.length; i += 1) {
        item = $queue[i];
        if (!item.cancelled) {
          try {
            item.callback(lastTime);
          } catch (error) {
            setTimeout(() => {
              throw error;
            });
          }
        }
      }
    }, timeToCall);
  }
  // Increment id
  id += 1;
  //
  queue.push({ handle: id, callback, cancelled: false });
  return id;
}

// Polyfill for cancelAnimationFrame
function emulateCancel(handle: number): void {
  for (let i = 0; i < queue.length; i += 1) {
    if (queue[i].handle === handle) {
      queue[i].cancelled = true;
    }
  }
}

// Polyfill requestAnimationFrame & cancelAnimationFrame altogether.
function polyfill(): void {
  if (!window.cancelAnimationFrame) {
    // If either cancel or request function does not exist,
    // use emulated version for both.
    if (!prefixedCancel || !prefixedRequest) {
      window.cancelAnimationFrame = emulateCancel;
      window.requestAnimationFrame = emulateRequest;
      return;
    }
    // Use vendor-prefixed cancel
    window.cancelAnimationFrame = prefixedCancel;
  }
  if (!window.requestAnimationFrame) {
    // Use vendor-prefixed request
    window.requestAnimationFrame = prefixedRequest;
  }
}

export { polyfill };
