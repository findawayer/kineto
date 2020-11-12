import { vendorPrefix } from './internals';

// Vendor-prefixed version of `HTMLElement.prototype.matchesSelector`.
export const matchesProperty = vendorPrefix<HTMLElement>(
  HTMLElement.prototype,
  'matchesSelector',
  ['moz', 'ms', 'o', 'webkit'],
);
