/**
 * Original source from react-bootstrap/dom-helpers (MIT License)
 * https://github.com/react-bootstrap/dom-helpers/blob/master/src/canUseDOM.ts
 */
export const supportsDOM = !!(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
);

// Whether the browser supports `document.implementation.hasFeature`
export const supportsHasFeature =
  supportsDOM &&
  document.implementation &&
  document.implementation.hasFeature &&
  // Always returns true in newer browsers as per the standard.
  // @see http://dom.spec.whatwg.org/#dom-domimplementation-hasfeature
  document.implementation.hasFeature('', '') !== true;
