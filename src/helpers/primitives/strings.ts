/**
 * `String.prototype.startsWith` with backward compatibilty
 *
 * @param value - The string to test.
 * @param search - The character(s) we expect to be at the start of the string.
 * @returns Whether the value starts with the search value.
 */
export function startsWith(value: string, search: string): boolean {
  if (String.prototype.startsWith) {
    return String.prototype.startsWith.call(value, search);
  }
  return value.slice(0, search.length) === search;
}

/**
 * Make a copy of the string passed such that the 1st character is uppercase
 * and the rest remaining as-is.
 *
 * @param value - The string to convert.
 * @returns The converted string.
 */
export function camelToPascal(value: string): string {
  return value[0].toUpperCase() + value.slice(1);
}
