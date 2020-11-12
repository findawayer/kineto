import { findValue, getElement, reduceObject } from 'helpers';
import type {
  ElementLike,
  KinetoId,
  KinetoInterface,
  MainStore,
} from 'typings';

/**
 * Kineto instance map holding relationship between ids and corresponding instances.
 * It allows us to:
 * - Get a specific Kineto instance either with id or container element.
 * - Get multiple instance in sync.
 */
const ref: MainStore = {};

/**
 * Connect a Kineto instance to the store.
 *
 * @param kineto - The Kineto instance to add.
 */
function register(kineto: KinetoInterface): void {
  const { id } = kineto;
  ref[id] = kineto;
}

/**
 * Disconnect a Kineto instance from the store.
 *
 * @param kineto - The Kineto instance to remove.
 */
function unregister(kineto: KinetoInterface): void {
  const { id } = kineto;
  delete ref[id];
}

/**
 * Find a kineto instance by its container element, or the selector pointing to it.
 *
 * @param container - Container element or selector of the instance we are looking for.
 * @returns The found kineto instance.
 */
function getInstanceByContainer(container: ElementLike): KinetoInterface {
  const containerElement = getElement(container);
  return findValue(
    ref,
    kineto => kineto.container.element === containerElement,
  );
}

/**
 * Find a kineto instance by its id.
 *
 * @param container - Id of the instance we are looking for.
 * @returns The found kineto instance.
 */
function getInstanceById(id: KinetoId): KinetoInterface {
  return findValue(ref, kineto => kineto.id === id);
}

/**
 * Find a kineto instance that satisfies the provided testing function.
 *
 * @param predicate - The function to execute on each key/value pair.
 * @returns The found kineto instance.
 */
function findInstances(
  predicate: (kineto: KinetoInterface) => boolean,
): KinetoInterface[] {
  return reduceObject(
    ref,
    (found, kineto) => {
      if (predicate(kineto)) {
        found.push(kineto);
      }
      return found;
    },
    [],
  );
}

/**
 * Call a method named `action` in all existing Kineto instances
 * that matches the id or the container element given through `target`,
 * passing `parameters` given.
 *
 * @param query
 * @param query.target - Id of target Kineto instances.
 * @param query.action - Name of the method to call.
 * @param query.parameters - Parameters to pass to the method.
 */
function dispatch({
  target,
  action,
  parameters = [],
}: {
  target: string | string[];
  action: string;
  parameters?: unknown[];
}): void {
  [].concat(target).forEach(id => {
    const kineto = getInstanceById(id);
    kineto && kineto[action] && kineto[action](...parameters);
    console.debug(`🔔 [ID:${kineto.id}] Dispatched [${action}] action.`);
  });
}

export {
  register,
  unregister,
  getInstanceByContainer,
  getInstanceById,
  findInstances,
  dispatch,
};
