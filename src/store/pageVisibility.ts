/**
 * @overview
 * Pause the stream to pause the stream temporarily when the document becomes invisible
 * (e.g. Browser tab becomes inactive, or the browser itself...) using Page Visibility API.
 * Kineto does not provide polyfill for this.
 * @see: https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
 */

import {
  isDocumentHidden,
  supportsPageVisibility,
  visibilityChange,
} from 'helpers';
import type { KinetoId } from 'typings';
import { dispatch, findInstances } from './main';

// List of ids of paused Kineto instances.
let paused: KinetoId[] = [];
// Flag stopping duplicate call of `init` or `destroy`
let isActive = false;

/**
 * Use Page Visibility API.
 */
function watchVisibilityChange(): void {
  if (!supportsPageVisibility || isActive) return;
  isActive = true;
  document.addEventListener(visibilityChange, toggleStream);
}

/**
 * Toggle streaming state of all Kineto instances with stream enabled,
 * based on the document's visibility.
 *
 * @param kineto - The Kineto instance to be unwatched.
 */
function toggleStream(): void {
  if (isDocumentHidden()) {
    paused = findInstances(kineto => kineto.stream.isActive).map(
      kineto => kineto.id,
    );
    dispatch({
      target: paused,
      action: 'pause',
      parameters: [{ passive: true }],
    });
  } else {
    dispatch({
      target: paused,
      action: 'resume',
      parameters: [{ passive: true }],
    });
    paused = null;
  }
}

export { watchVisibilityChange };
