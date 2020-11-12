import type { BaseOptions } from 'typings';
import { convertElements } from './elements';
import { checkRanges } from './ranges';
import { fixConflicts } from './conflicts';

/**
 * Test Kineto options with all available validators, and fix bad inputs.
 *
 * @param {object} options - The options to be fixed.
 * @returns {object} Fixed options.
 */
function fixOptions(options: BaseOptions): BaseOptions {
  // Make sure certain numeric options are within the predefined range.
  checkRanges(options);
  // Convert element selectors to corresponding DOM elements.
  convertElements(options);
  // Avoid contradicting options
  fixConflicts(options);
  // Return fixed options
  return options;
}

export { fixOptions };
