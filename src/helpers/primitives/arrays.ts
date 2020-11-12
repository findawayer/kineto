import type { FindPredicate } from 'typings';

/**
 * Pick the first item in an array.
 *
 * @param array - The array to extract value.
 * @returns The first item of the array.
 */
export function first<T>(array: T[]): T {
  return array[0];
}

/**
 * Pick the last item in an array.
 *
 * @param array - The array to extract value.
 * @returns The last item of the array.
 */
export function last<T>(array: T[]): T {
  return array[array.length - 1];
}

/**
 * Create a new array of given `length`, filled with `filler` value.
 *
 * @param length - Length of the created array.
 * @param filler - Value to fill the array with.
 * @returns The created array.
 */
export function newArray<T>(length: number, filler?: T): T[] {
  return [...new Array(length)].map(() => filler);
}

/**
 * Test if the `searchItem` is included in the `array`.
 *
 * @param searchItem - The item to search in the array.
 * @param array - The array to test.
 * @returns Whether the item is in the array.
 */
export function inArray<T>(searchItem: T, array: T[]): boolean {
  return array.indexOf(searchItem) !== -1;
}

/**
 * Test if all items in passed array satisfy the test function.
 *
 * @param array - The array to test.
 * @param predicate - The testing function to call on each item in the array.
 * @returns Whether the array consists of items that pass the test.
 */
export function every<T>(array: T[], predicate: FindPredicate<T>): boolean {
  const { length } = array;
  let index = 0;
  let item;
  for (; index < length; index += 1) {
    item = array[index];
    if (!predicate(item, index, array)) {
      return false;
    }
  }
  return true;
}

/**
 * Merged version of `Array.prototype.find` and `Array.prototype.findIndex`.
 *
 * @param array - The array to find the item from.
 * @param predicate - The testing function to call on each item in the array.
 * @param asIndex - Whether to return the item itself or its index.
 * @returns The found item or its index, according to the `asIndex` value above.
 */
function find<T>(array: T[], predicate: FindPredicate<T>, asIndex?: false): T;
function find<T>(
  array: T[],
  predicate: FindPredicate<T>,
  asIndex: true,
): number;
function find<T>(
  array: T[],
  predicate: FindPredicate<T>,
  asIndex = false,
): number | T {
  const { length } = array;
  let index = 0;
  let currentValue;
  while (index < length) {
    currentValue = array[index];
    if (predicate(currentValue, index, array)) {
      return asIndex ? index : currentValue;
    }
    index += 1;
  }
  return asIndex ? -1 : undefined;
}

/**
 * `Array.prototype.find` with backward compatibilty.
 *
 * @param array - The array to find the item from.
 * @param predicate - The testing function to call on each item in the array.
 * @returns The found item.
 */
export function findInArray<T>(array: T[], predicate: FindPredicate<T>): T {
  return find<T>(array, predicate);
}

/**
 * `Array.prototype.findIndex` with backward compatibilty.
 *
 * @param array - The array to find the item from.
 * @param predicate - The testing function to call on each item in the array.
 * @returns The index of found item.
 */
export function findIndexInArray<T>(
  array: T[],
  predicate: FindPredicate<T>,
): number {
  return find<T>(array, predicate, true);
}

/**
 * Invoke the iteratee by `count` times.
 *
 * @param count - The number of times to invoke `iteratee`.
 * @param iteratee - The function invoked on each iteration.
 */
export function times(count: number, iteratee: (index: number) => void): void {
  for (let index = 0; index < count; index += 1) {
    iteratee(index);
  }
}

/**
 * Add a new `item` in the `array`.
 *
 * @param array - The array to add the item to.
 * @param item - The item to add.
 */
export function addItem(array: unknown[], item: unknown): void {
  if (!inArray(item, array)) {
    array.push(item);
  }
}

/**
 * Remove an `item` from the `array`.
 *
 * @param array - The array to remove the item from.
 * @param item - The item to remove.
 * @returns The filtered array.
 */
export function removeItem<T extends unknown>(array: T[], item: T): T[] {
  const index = array.indexOf(item);
  if (index !== -1) {
    array.splice(index, 1);
  }
  return array;
}
