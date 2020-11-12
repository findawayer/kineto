import {
  AlignOption,
  HeightOption,
  ModeOption,
  ResponsiveModeOption,
} from 'typings';
import type { BaseOptions } from 'typings';
import { defaultEasing } from './easing';

export const defaultOptions: BaseOptions = {
  // layout
  mode: ModeOption.Horizontal,
  align: AlignOption.Center,
  perView: 'auto',
  height: HeightOption.Auto,
  margin: 10,
  loop: false,
  startAt: 0,
  // movement
  moveBy: 1,
  speed: 600,
  easing: defaultEasing,
  moveOnClick: false,
  waitAnimation: false,
  // streaming
  stream: false,
  streamEvery: 3000,
  streamRewind: true,
  pauseOnFocus: true,
  pauseOnHover: false,
  // sync
  syncId: null,
  // navigation
  arrows: true,
  arrowsInto: null,
  arrowTemplate: null,
  count: false,
  countInto: null,
  countTemplate: null,
  pagination: true,
  paginationInto: null,
  paginationTemplate: null,
  // swipe support
  touchSwipe: true,
  mouseSwipe: true,
  swipeThreshold: 3,
  swipeMultiplier: 1,
  swipeEdgeBounce: true,
  swipeEdgeFriction: 0.8,
  // mouse wheel support
  wheel: false,
  wheelTarget: null,
  wheelThrottle: 'auto',
  wheelEdgeRelease: true,
  // sound reader support
  aria: true,
  // css values
  cssPrecision: 3,
  usePercent: false,
  // responsive
  responsive: true,
  responsiveDelay: 100,
  responsiveMode: ResponsiveModeOption.MobileFirst,
};
