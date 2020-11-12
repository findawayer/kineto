/* eslint-disable compat/compat */
import { vendorPrefix } from './internals';

// `performance.now()` is available
// https://developer.mozilla.org/ko/docs/Web/API/Performance/now
const supportsPerformance = typeof window.performance !== 'undefined';

// Vendor-prefixed `performance.now`
const performanceNow =
  supportsPerformance && vendorPrefix<Performance>(window.performance, 'now');

// Get the relative timestamp of current time in miliseconds
// with `Date.now` fallback for backward compatibility
export const now =
  performance[performanceNow] || 'now' in Date
    ? Date.now
    : () => new Date().getTime();

// `InteractionObserver` is available
// https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
export const supportsIntersectionObserver =
  typeof IntersectionObserver === 'function';

// Page Visibility API
// https://developer.mozilla.org/ko/docs/Web/API/Page_Visibility_API
// Document's visibility state
const documentHidden = vendorPrefix<Document>(document, 'hidden', [
  'ms',
  'webkit',
]);

// Availability
export const supportsPageVisibility = !!documentHidden;

// Event name
export const visibilityChange = supportsPageVisibility
  ? documentHidden.replace(/hidden/i, 'visibilitychange')
  : undefined;

// Test if user left the document
export const isDocumentHidden = (): boolean => document[documentHidden];
