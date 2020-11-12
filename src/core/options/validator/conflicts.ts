import { isFloat } from 'helpers';
import { AlignOption } from 'typings';
import type { BaseOptions } from 'typings';

/**
 * Correct contradictory declarations in Kineto options.
 *
 * @param options Options to fix conflicts.
 */
function fixConflicts(options: BaseOptions): void {
  const { align, loop, moveBy, perView } = options;
  if (loop && align === AlignOption.Justify) {
    options.align = AlignOption.Center;
    console.warn(
      `Looping slides cannot have edges; align option is modified to 'center'`,
    );
  }
  if (moveBy && moveBy !== 'auto') {
    if (isFloat(moveBy)) {
      options.moveBy = Math.round(moveBy);
      console.warn(
        `Requires an integer value for moveBy option; rounded to ${options.moveBy}`,
      );
    }
    if (moveBy > perView) {
      options.moveBy = perView;
      console.warn(
        `The moveBy value is greater than perView; rounded to ${options.perView}`,
      );
    }
  }
}

export { fixConflicts };
