import { polyfillRequestAnimationFrame } from 'polyfills';
import { watchVisibilityChange } from 'store';
import api from './api';
import './styles/index.scss';
// Polyfill `window.requestAnimationFrame`
polyfillRequestAnimationFrame();
// Watch page visibility change
watchVisibilityChange();
// App version (replaced with `version` value in package.json while compiling)
declare const __VERSION__: string;
// Expose objects below to `global.Kineto` namespace
export default {
  VERSION: __VERSION__,
  ...api,
};
