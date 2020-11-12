import { hasKey, mapValue } from 'helpers';
import type {
  ClassNames,
  ClassNameFormat,
  ClassNameQuery,
  UserClassNameFormat,
} from 'typings';
import availableFormats, { block } from './formats';
import classNameSchema from './schema';

// Default formatting rule for classNames
const defaultFormat = 'kebabcase';

// Object containing actually used classNames and their access keys.
let classNames = createClassNames(defaultFormat);

/**
 * Create a new className map following the `format` rule passed.
 *
 * @param format - Naming rule for classNames; accepts 'kebabcase' and 'BEM'.
 * @returns Created className map.
 */
function createClassNames(format: ClassNameFormat): ClassNames {
  if (!hasKey(availableFormats, format)) {
    throw new Error(`Invalid className format: ${format}`);
  }
  const selectedFormat = availableFormats[format];
  return mapValue(classNameSchema, value => selectedFormat(value));
}

/**
 * Configure CSS classes for all Kineto instances. Expects a string
 * representing class methodology, or a custom formatter function as parameter.
 * -- This method is exposed to the API. --
 *
 * @param userFormat - Formating method for CSS classes.
 */
function setClassFormat(userFormat: UserClassNameFormat): void {
  switch (typeof userFormat) {
    case 'string':
      classNames = createClassNames(userFormat);
      break;

    case 'function':
      classNames = mapValue(
        classNameSchema,
        ({ element, modifier }: ClassNameQuery) =>
          userFormat(block, [].concat(element), modifier),
      );
      break;

    default:
      throw new Error();
  }
}

export { classNames, setClassFormat };
