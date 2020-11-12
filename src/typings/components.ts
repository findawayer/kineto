import type { EasingFunction } from 'bezier-easing';
import type { EasingOption, ResponsiveOptions } from './options';

// Query for `animation.start()` method
export interface AnimationStartQuery {
  targetTranslate?: number;
  tick?: (now: number) => void;
  duration?: number;
  easing?: EasingOption;
  onComplete?: () => void;
}

// Animation component
export interface Animation {
  isActive: boolean;
  hasPath: boolean;
  duration: number;
  easing: EasingFunction;
  tick: (now: number) => void;
  frameId: number;
  startTime: number;
  from?: number;
  to?: number;
  start: (query: AnimationStartQuery) => void;
  stop: () => void;
}

// Arrows component
export interface Arrows {
  element: {
    wrapper: HTMLElement;
    previous: HTMLButtonElement;
    next: HTMLButtonElement;
  };
  previousDisabled: boolean;
  nextDisabled: boolean;
  removeListener: () => unknown;
  update: (currentIndex: number) => void;
}

// Count component
export interface Count {
  element: HTMLElement;
  update: (currentIndex: number) => void;
}

// Pagination component
export interface Pagination {
  element: {
    wrapper: HTMLElement;
    buttons: HTMLButtonElement[];
  };
  removeListener: () => unknown;
  updateCurrent: (currentIndex: number) => void;
  updateLength: () => void;
}

// Map holding relational data between responsive breakpoints & options
export type ResponsiveMap = {
  width: number;
  options: ResponsiveOptions;
}[];

// Responsive component
export interface Responsive {
  map: ResponsiveMap;
  currentIndex: number;
  removeListeners: (() => unknown)[];
  getCurrentIndex: () => number;
  getCurrentOptions: (index: number) => ResponsiveOptions;
  updateOptions: () => void;
}

// Options for `stream.pause()` and `stream.resume()` methods
export type StreamOptions = {
  passive?: boolean;
};

// Stream component
export interface Stream {
  isInit: boolean;
  isActive: boolean;
  timeoutId: number;
  removeListeners: (() => unknown)[];
  destroy: () => void;
  play: () => void;
  pause: (options?: StreamOptions) => void;
  resume: (options?: StreamOptions) => void;
}

// Time and position data recorded at a short interval during a swipe movement
type SwipeTrace = { time: number; position: number };

// Swipe component
export interface Swipe {
  target: HTMLElement;
  eventId: number;
  isTouch: boolean;
  isScroll: boolean;
  hasMoved: boolean;
  hasReleased: boolean;
  startTime: number;
  startX: number;
  startY: number;
  startTranslate: number;
  currentTranslate: number;
  nextTranslate: number;
  trace: SwipeTrace[];
  velocity: number;
  removeListeners: (() => unknown)[];
  removeDynamicListeners: (() => unknown)[];
  follow: () => void;
  restore: () => void;
  moveToTarget: () => void;
  addTrace: (position: number) => void;
  getVelocity: () => number;
  applyEdgeFriction: (translate: number) => number;
}

// Wheel event with normalized delta data
export interface ProgressiveWheelEvent extends WheelEvent {
  wheelDelta: number;
  wheelDeltaX: number;
  wheelDeltaY: number;
}

// Wheel component
export interface Wheel {
  target: HTMLElement | Document;
  lastCall: number;
  removeListener: () => unknown;
}
