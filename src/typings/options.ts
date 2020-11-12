import type { ElementLike } from './helpers';

/**
 * Enums below are necessary:
 * - To be able to iterate over all possible values.
 * - To allow modify values in one go.
 */

// `mode` option
export enum ModeOption {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
}

// `align` option
export enum AlignOption {
  Center = 'center',
  Start = 'start',
  End = 'end',
  Justify = 'justify',
}

// `height` option
export enum HeightOption {
  Auto = 'auto',
  Equal = 'equal',
  Adaptive = 'adaptive',
}

// Numeric input for `easing` option; describes a bezier curve points
export type EasingPoints = [number, number, number, number];

// String input for `easing` option; describes a bezier function name
export enum EasingPreset {
  Ease = 'ease',
  EaseIn = 'easeIn',
  EaseOut = 'easeOut',
  EaseInOut = 'easeInOut',
  EaseInSine = 'easeInSine',
  EaseOutSine = 'easeOutSine',
  EaseInOutSine = 'easeInOutSine',
  EaseInQuad = 'easeInQuad',
  EaseOutQuad = 'easeOutQuad',
  EaseInOutQuad = 'easeInOutQuad',
  EaseInCubic = 'easeInCubic',
  EaseOutCubic = 'easeOutCubic',
  EaseInOutCubic = 'easeInOutCubic',
  EaseInQuart = 'easeInQuart',
  EaseOutQuart = 'easeOutQuart',
  EaseInOutQuart = 'easeInOutQuart',
  EaseInQuint = 'easeInQuint',
  EaseOutQuint = 'easeOutQuint',
  EaseInOutQuint = 'easeInOutQuint',
  EaseInExpo = 'easeInExpo',
  EaseOutExpo = 'easeOutExpo',
  EaseInOutExpo = 'easeInOutExpo',
  EaseInCirc = 'easeInCirc',
  EaseOutCirc = 'easeOutCirc',
  EaseInOutCirc = 'easeInOutCirc',
  EaseInBack = 'easeInBack',
  EaseOutBack = 'easeOutBack',
  EaseInOutBack = 'easeInOutBack',
  Linear = 'linear',
}

// `easing` option
export type EasingOption = EasingPoints | EasingPreset;

// All options except `responsive`
export type Options = {
  // sync
  syncId: string;
  // layout
  mode: ModeOption;
  align: AlignOption;
  perView: 'auto' | number;
  height: HeightOption;
  margin: number;
  loop: boolean;
  // movement
  startAt: number;
  moveBy: 'auto' | number;
  moveOnClick: boolean;
  // animation
  speed: number;
  easing: EasingOption;
  waitAnimation: boolean;
  // streaming
  stream: boolean;
  streamEvery: number;
  streamRewind: boolean;
  pauseOnFocus: boolean;
  pauseOnHover: boolean;
  // navigation
  arrows: boolean;
  arrowsInto: ElementLike;
  arrowTemplate: [string, string];
  count: boolean;
  countInto: ElementLike;
  countTemplate: string;
  pagination: boolean;
  paginationInto: ElementLike;
  paginationTemplate: string;
  // swipe support
  touchSwipe: boolean;
  mouseSwipe: boolean;
  swipeThreshold: number;
  swipeMultiplier: number;
  swipeEdgeBounce: boolean;
  swipeEdgeFriction: number;
  // mouse wheel support
  wheel: boolean;
  wheelTarget: ElementLike;
  wheelThrottle: 'auto' | number;
  wheelEdgeRelease: boolean;
  // sound reader support
  aria: boolean;
  // css values
  cssPrecision: number;
  usePercent: boolean;
};

// `responsiveMode` option
export enum ResponsiveModeOption {
  DesktopFirst = 'desktop-first',
  MobileFirst = 'mobile-first',
}

// Subset of options augmented to the options above
export type ResponsiveOptions = Partial<Options>;

// All options; type of `kineto.baseOptions`
export type BaseOptions = Options & {
  responsive:
    | boolean
    | {
        [breakpoint: string]: ResponsiveOptions;
      };
  responsiveDelay: number;
  responsiveMode: ResponsiveModeOption;
};

// Subset of baseOptions that user can provide to `Kineto.create()` method
export type UserOptions = Partial<BaseOptions>;
