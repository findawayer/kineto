import { mapValue, reduceObject, startsWith } from 'helpers';
import type {
  BaseOptions,
  Options,
  ResponsiveOptions,
  UserOptions,
} from 'typings';
import { AlignOption } from 'typings';
import { defaultOptions } from './defaults';
import { fixOptions } from './validator';

/**
 * Modifiable version of default options. The `baseOptions` data is generated
 * on top of this value, while the `defaultOptions` function as a data dictionary
 * that the validator makes use of.
 */
let customDefaultOptions = defaultOptions;

/**
 * Configure globally-used default options with custom values.
 * -- This method is exposed to the API. --
 *
 * @param userOptions - User-defined default options overriding `defaultOptions`.
 */
function setDefaultOptions(userDefaults: UserOptions): void {
  customDefaultOptions = createDefaults(customDefaultOptions, userDefaults);
}

/**
 * Create new defaults based on `base` and inherit values from `overrides`,
 * excluding `undefined` values from `overrides`.
 *
 * @param base - The source defaults.
 * @param overrides - The modifications to the source defaults.
 * @returns Created default options.
 */
function createDefaults(
  base: BaseOptions,
  overrides: UserOptions = {},
): BaseOptions {
  const mergedOptions = mapValue(base, (value, key) => {
    return overrides[key] !== undefined ? overrides[key] : value;
  });
  return fixOptions(mergedOptions as BaseOptions);
}

/**
 * Create base options for a Kineto instance.
 *
 * @param userOptions - User-defined options overriding `customDefaultOptions`.
 * @returns Created base options.
 */
function createBaseOptions(userOptions: UserOptions): BaseOptions {
  return createDefaults(customDefaultOptions, userOptions);
}

/**
 * Create a new object representing Kineto options for current responsive range,
 * inheriting `base` and `overrides` options in order.
 *
 * @param base - The source options.
 * @param overrides - The modifications to the source options.
 * @returns Created options.
 */
function createResponsiveOptions(
  base: BaseOptions,
  overrides?: ResponsiveOptions,
): Options {
  if (!overrides) {
    return base;
  }
  return reduceObject(
    base,
    (options, value, key) => {
      // Exclude options starting with `responsive`
      if (!startsWith(key, 'responsive')) {
        // Copy values from overrideOptions, fallback to `base` if non-existent
        options[key] = overrides[key] !== undefined ? overrides[key] : value;
      }
      return options;
    },
    {} as Options,
  );
}

/**
 * Convert `align` option value to a mathematical factor.
 * `center`(default value) and `justify` have the same output.
 *
 * @param align - The layout type for the slides.
 * @returns Calculated align factor.
 */
function getAlignFactor(align: Options['align']): number {
  switch (align) {
    case AlignOption.Start:
      return 0;

    case AlignOption.End:
      return 1;

    default:
      return 0.5;
  }
}

/**
 * Stringify `syncId` option, while taking
 *
 * @param syncId - The id for synced Kineto instances.
 * @returns Normalized sync id.
 */
function parseSyncId(syncId: unknown): string {
  if (syncId === null || syncId === undefined) {
    return undefined;
  }
  return String(syncId);
}

export {
  setDefaultOptions,
  createBaseOptions,
  createResponsiveOptions,
  getAlignFactor,
  parseSyncId,
};
