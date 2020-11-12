import type {
  UnknownObject,
  ObjectIteratee,
  ObjectPredicate,
  ObjectReducer,
} from 'typings';

/**
 * Test if the argument is an object.
 *
 * @param value - What we expect to be an object.
 * @returns Whether the value is an object.
 */
export function isObject(value: unknown): value is UnknownObject {
  return value !== null && typeof value === 'object';
}

/**
 * Test if the `object` has the given `key`, without getting fooled
 * by prototypes. This also safely passes `no-prototype-builtins` eslint rule.
 *
 * @param object - The object to iterate over.
 * @param iteratee - The function invoked per iteration.
 * @returns Whether the passed key is a key of the passed object.
 */
export function hasKey(obj: UnknownObject, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * Iterate over an object and call `iteratee` over its entries.
 *
 * @param object The object to iterate over.
 * @param iteratee The function invoked per iteration.
 */
export function eachValueKey<T extends UnknownObject>(
  obj: T,
  iteratee: ObjectIteratee<T, unknown>,
): void {
  for (const key in obj) {
    // Skip prototypes
    if (hasKey(obj, key)) {
      const value = obj[key];
      iteratee(value, key);
    }
  }
}

/**
 * Create a new object with generated values from calling `iteratee` function
 * on entries of the passed `object`.
 *
 * @param object - The object to iterate over.
 * @param iteratee -The function invoked per iteration.
 * @returns The created object.
 */
export function mapValue<T extends UnknownObject, R>(
  object: T,
  iteratee: ObjectIteratee<T, R>,
): Record<keyof T, R> {
  const result = {} as Record<keyof T, R>;
  for (const key in object) {
    // Skip prototyp es
    if (hasKey(object, key)) {
      const value = object[key];
      result[key] = iteratee(value, key);
    }
  }
  return result;
}

/**
 * Find the key/value pair in the passed `object` that satisfies
 * the passed testing function.
 *
 * @param object - The object to look into.
 * @param predicate - The function to execute on each key/value pair.
 * @returns The found value.
 */
export function findValue<T extends UnknownObject>(
  object: T,
  predicate: ObjectPredicate<T>,
): T[keyof T] {
  for (const key in object) {
    if (hasKey(object, key)) {
      const value = object[key];
      if (predicate(value, key)) {
        return value;
      }
    }
  }
  return null;
}

/**
 * Object version of `Array.prototype.reduce`.
 * Creates a new value that reflects modifications made by
 * running `iteratee` on each key/value pair of the `object`.
 *
 * @param object - The object to look into.
 * @param reducer - The function to execute on each key/value pair.
 * @param initialValue - Initial data of `accumulator` in reducer.
 * @returns The found key/value pair.
 */
export function reduceObject<I extends UnknownObject, O extends unknown>(
  object: I,
  reducer: ObjectReducer<I, O>,
  initialValue: O,
): O {
  let accumulator = initialValue;
  for (const key in object) {
    if (hasKey(object, key)) {
      const value = object[key];
      accumulator = reducer(accumulator, value, key, object);
    }
  }
  return accumulator;
}
