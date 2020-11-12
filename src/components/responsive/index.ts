/**
 * @overview
 * The responsive component provide the ability to refresh the size & positionning of
 * elements and to update the local settings of a Kineto instance in reaction to
 * the viewport width changes.
 *
 * It is from this component the actual `options` for the core class are defined;
 * this is the reason why this component should:
 * - use `baseOptions` instead of `options` unlike the other components
 * - and be mounted before parsing the options
 */

import debounce from 'lodash.debounce';
import { addEvent, isObject, reduceObject } from 'helpers';
import type {
  BaseOptions,
  KinetoInterface,
  ResponsiveOptions,
  ResponsiveMap,
} from 'typings';
import { ResponsiveModeOption } from 'typings';

/**
 * Initialize the component.
 *
 * @this kineto - Current Kineto instance.
 */
function init(this: KinetoInterface): void {
  const { baseOptions, responsive } = this;
  // If user has provided custom options per breakpoints, process them
  // for optimal runtime performance.
  responsive.map = createResponsiveMap(baseOptions);
  // Listen to viewport resize events
  const debouncedResize = debounce(
    responsive.updateOptions,
    baseOptions.responsiveDelay,
  );
  responsive.removeListeners = [
    addEvent<Window>({
      target: window,
      type: 'resize',
      listener: debouncedResize,
    }),
    addEvent<Window>({
      target: window,
      type: 'orientationchange',
      listener: debouncedResize,
    }),
  ];
  // Add state class when initialization is complete.
  // (This should be done async because the container element is not initilized yet
  // when the responsive component is getting mounted.)
  this.once('init', () => this.addStateClass('responsive'));
}

/**
 * Reset changes made while creating the component.
 *
 * @this kineto - Current Kineto instance.
 */
function destroy(this: KinetoInterface): void {
  const { responsive } = this;
  // Remove DOM event listeners
  responsive.removeListeners.forEach(remove => remove());
  // Remove CSS class
  this.removeStateClass('responsive');
  // Clear data
  delete responsive.map;
  delete responsive.currentIndex;
  delete responsive.removeListeners;
}

/**
 * Create a map linking a responsive breakpoint to the relevant options,
 * using the details initially provided with user options.
 *
 * Example of what the result looks like:
 * [
 *   { width: 800, options: { margin: 10 }},
 *   { width: 1200, options: { margin: 20 }},
 * ]
 *
 * @param userOptions
 * @param userOptions.responsive - Array of object holding breakpoint and options pairs.
 * @param userOptions.responsiveMode - The way the default settings are considered —
 *   mobile-first or desktop-first approach.
 */
function createResponsiveMap({
  responsive,
  responsiveMode,
}: BaseOptions): ResponsiveMap {
  if (!isObject(responsive)) {
    return null;
  }
  const mobileFirst = responsiveMode === 'mobile-first';
  // Create an array of breakpoint and corresponding options,
  // and return them sorted according to the `responsiveMode` option.
  return reduceObject(
    responsive,
    (breakpoints, options, width) => {
      const parsedWidth = parseInt(width as string, 10);
      if (typeof breakpoints[width] !== 'undefined') {
        console.error(`Duplicate responsive breakpoint: ${width}.`);
      } else if (isNaN(parsedWidth)) {
        console.error(`Invalid responsive breakpoint: ${width}.`);
      } else {
        breakpoints.push({ width: parsedWidth, options });
      }
      return breakpoints;
    },
    [] as ResponsiveMap,
  ).sort((a, z) => (mobileFirst ? a.width - z.width : z.width - a.width));
}

/**
 * Get the augmented options to the `baseOptions` matching current breakpoint.
 *
 * @this kineto - Current Kineto instance.
 * @param index - The index of responsive map
 */
function getCurrentOptions(
  this: KinetoInterface,
  index: number,
): ResponsiveOptions {
  const { responsive } = this;
  const breakpointIndex =
    typeof index === 'number' ? index : responsive.currentIndex;
  const breakpoint = responsive.map[breakpointIndex];
  return breakpoint ? breakpoint.options : undefined;
}

/**
 * Find the index of current breakpoint. The `breakpoints` array contains
 * responsive breakpoints based on the `responsiveMode` option.
 * In `mobile-first` approach, breakpoints are sorted in ascending order,
 * and `desktop-first` approach descending order.
 *
 * The function iterates over the breakpoints forewards and find the matching zone.
 * Let's say current viewport width is 700px:
 *
 * Mobile-first
 * 480 <- i
 * 640 <- return previous
 * 768 viewportWidth < breakpoint
 * 980
 *
 * Desktop-first:
 * 980 <- i
 * 768 <- return previous
 * 640 viewportWidth > breakpoint
 * 480
 *
 * @param map - Array of breakpoint/options pairs.
 * @param strategy - The responsive approach.
 * @returns Index pointing current breakpoint/options in the responsive map.
 */
function getCurrentIndex(
  breakpoints: ResponsiveMap,
  strategy: ResponsiveModeOption,
): number {
  const viewportWidth = window.innerWidth;
  const desktopFirst = strategy === ResponsiveModeOption.DesktopFirst;
  let i = 0;
  const { length } = breakpoints;
  let breakpoint;
  let previous = -1;
  while (i < length) {
    breakpoint = breakpoints[i].width;
    if (
      desktopFirst ? viewportWidth > breakpoint : viewportWidth < breakpoint
    ) {
      break;
    }
    previous = i;
    i += 1;
  }
  return previous;
}

/**
 * Update settings of a Kineto instance using the responsive map and pointer index defined.
 *
 * @this kineto - Current Kineto instance.
 */
function updateOptions(this: KinetoInterface): void {
  const { baseOptions, isInit, responsive } = this;
  // Update options based on viewport width
  if (responsive.map) {
    const index = getCurrentIndex(responsive.map, baseOptions.responsiveMode);
    if (index !== responsive.currentIndex) {
      responsive.currentIndex = index;
      const currentOptions = getCurrentOptions.call(this, index);
      // `config()` will automatically invoke `refresh()` at the end of process
      this.config(currentOptions);
    }
  }
  // Refresh the layout regardless
  if (isInit) {
    this.refresh();
  }
}

export default {
  name: 'responsive',
  test: (kineto: KinetoInterface): boolean => !!kineto.baseOptions.responsive,
  init,
  destroy,
  bind: {
    updateOptions,
  },
};
