import { dummyElement, findCSSProperty } from './internals';

// Vendor-prefixed CSS property for `transform`.
export const transformProperty = findCSSProperty([
  'transform',
  'msTransform',
  'MozTransform',
  'webkitTransform',
  'OTransform',
]);

// Vendor-prefixed CSS property for `transition`.
export const transitionProperty = findCSSProperty([
  'transition',
  'webkitTransition',
  'OTransition',
  'otransition',
]);

// Whether the browser supports 3d transform
export const supports3dTransform = test3dTransformSupport(dummyElement);

/**
 * Test the availability of 3d transform.
 *
 * @param dummy - Dummy element to help the test.
 * @returns Whether 3d transform is supported.
 */
function test3dTransformSupport(dummy: HTMLElement): boolean {
  let supports = false;
  document.body.appendChild(dummy);
  dummy.style[transformProperty] = 'translate3d(0, 0, 0)';
  supports = !!getComputedStyle(dummy).getPropertyValue(transformProperty);
  document.body.removeChild(dummy);
  return supports;
}

// Vendor-prefixed CSS property for `user-select`.
export const userSelectProperty = findCSSProperty([
  'userSelect',
  'MozUserSelect',
  'MsUserSelect',
  'WebkitUserSelect',
]);
