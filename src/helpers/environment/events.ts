/* eslint-disable getter-return, no-empty */
import { supportsDOM, supportsHasFeature } from './DOM';

// Whether the browser supports `HTMLElement.prototype.addEventListener`.
export const supportsAddEventListener =
  supportsDOM && 'addEventListener' in HTMLElement.prototype;

// Test event listener options
// https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Safely_detecting_option_support
export const supportsPassiveListener = testPassiveListener();

/**
 * Test the support of `passive` option as parameter of `addEventListener`.
 *
 * @returns Whether passive listener option is supported.
 */
function testPassiveListener(): boolean {
  let supports = false;
  try {
    const options = {
      get passive() {
        supports = true;
        return false;
      },
    };
    if (supportsDOM) {
      window.addEventListener('test', null, options as EventListenerOptions);
      window.removeEventListener('test', null, options as EventListenerOptions);
    }
  } catch (_) {}
  return supports;
}

// Vendor-prefixed wheel event namespace. (Don't bother with legacy FireFox)
export const wheelEvent = getWheelEvent();

/**
 * Find the `wheel` event type with correct vendor prefix.
 *
 * @returns Vendor-prefixed wheel event namespace.
 */
function getWheelEvent(): 'wheel' | 'mousewheel' {
  if (!supportsAddEventListener) {
    return null;
  }
  let supports = 'onwheel' in document;
  const div = document.createElement('div');

  // `onwheel` is supported
  if (!supports) {
    div.setAttribute('onwheel', 'return;');
    supports = typeof div.onwheel === 'function';
  }
  // `wheel` is supported
  if (!supports && supportsHasFeature) {
    // This is the only way to test support for the `wheel` event in IE9+.
    supports = document.implementation.hasFeature('Events.wheel', '3.0');
  }

  return supports ? 'wheel' : 'mousewheel';
}
