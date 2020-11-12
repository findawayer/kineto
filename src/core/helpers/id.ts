import type { KinetoId } from 'typings';

// Count number used to generate Kineto IDs.
let count = -1;

/**
 * Generate an unique id for a Kineto instance. We are converting numeric count
 * to a string to avoid unexpected result in the future when the store caches
 * these IDs as object keys, which automatically stringifies them.
 *
 * @returns The generated ID.
 */
function generateId(): KinetoId {
  count += 1;
  return count.toString();
}

export { generateId };
