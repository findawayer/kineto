import type { ClassNameQuery } from 'typings';

// The block: standalone entity that is meaningful on its own.
export const block = 'kineto';

/**
 * Format a className based on BEM rules. (block__element--modifier)
 *
 * @param query
 * @param query.element - Element. A part of the block.
 * @param query.modifier - Modifier. A flag on a block or an element.
 * @returns The formatted className.
 */
function BEM({ element, modifier }: ClassNameQuery): string {
  const blockElement = joinStack(block, element, '__');
  return joinEach(blockElement, modifier, '--');
}

/**
 * Format a kebabcase-based className. (block-element block-modifier)
 *
 * @param query
 * @param query.element - Element. A part of the block.
 * @param query.modifier - Modifier. A flag on a block or an element.
 * @returns The formatted className.
 */
function kebabcase({ element, modifier }: ClassNameQuery): string {
  const joiner = '-';
  if (modifier) {
    return joinEach(block, modifier, joiner);
  }
  if (element) {
    return joinStack(block, element, joiner);
  }
  return block;
}

/**
 * Add string(s) to base string, by multiplying as many as `add` strings passed.
 *
 * @exmample joinStack('a', ['b', 'c', 'd']) // 'a-b a-c a-d'
 * @param base - The base string to add up onto.
 * @param add - The added string(s) to the base string.
 * @param joiner - Seperator string that joins two strings.
 * @returns The formatted string.
 */
function joinEach(base: string, add?: string | string[], joiner = '-'): string {
  if (!add) return base;
  return []
    .concat(add)
    .map(a => base + joiner + a)
    .join(' ');
}

/**
 * Add string(s) to base string back to back.
 *
 * @exmample joinStack('a', ['b', 'c', 'd']) // 'a-b-c-d'
 * @param base - The base string to add up onto.
 * @param add - The added string(s) to the base string.
 * @param joiner - Seperator string that joins two strings.
 * @returns The formatted string.
 */
function joinStack(
  base: string,
  add?: string | string[],
  joiner = '-',
): string {
  if (!add) return base;
  return [base].concat(add).join(joiner);
}

export default {
  BEM,
  kebabcase,
};
