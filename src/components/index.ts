/**
 * @overview
 * Kineto consists of a core class `Kineto` and multiple components registered
 * as a member of it. Each component provides a group of related functions,
 * that inherit the Kineto instance as its context.
 *
 * There are 2 types of components: mandatory and optional. Mandatory components
 * stay mounted until the instance is destroyed, while optional ones get
 * mounted/unmounted based as the options change.
 */

import animation from './animation';
import arrows from './arrows';
import count from './count';
import elements from './elements';
import pagination from './pagination';
import responsive from './responsive';
import stream from './stream';
import swipe from './swipe';
import wheel from './wheel';

/**
 * Components that are always mounted no matter what.
 */
export const requiredComponents = {
  ...elements,
  animation,
};

/**
 * Components that are mounted or unmounted conditionally, either by
 * configuration of static options or a responsive changes to the options.
 */
export const optionalComponents = {
  arrows,
  count,
  pagination,
  responsive,
  stream,
  swipe,
  wheel,
};

export { responsive };

export default {
  ...requiredComponents,
  ...optionalComponents,
  responsive,
};
