import type {
  AddEventQuery,
  DelegateEventQuery,
  EventBindable,
  EventDelegatable,
} from 'typings';
import { getClosestElement } from './query';
import { supportsPassiveListener } from '../environment/events';

/**
 * Add an event listener of `type` given to the `target` element, and return
 * the event remover function for the attached listener to be able to clear it later.
 *
 * @param query
 * @param query.target - Target element we want to add the listener to.
 * @param query.type - The event type to listen to.
 * @param query.listener - The event handler function.
 * @param query.options - The event options.
 * @returns Remover for the attached listener.
 */
function addEvent<T extends EventBindable>({
  target,
  type,
  listener,
  options,
}: AddEventQuery<T>): () => void {
  let eventOptions = options;
  // Convert options to boolean if object option is not supported
  if (
    typeof options === 'object' &&
    options.passive &&
    !supportsPassiveListener
  ) {
    eventOptions = options.capture || false;
  }
  // Add event listener
  target.addEventListener(
    type as string,
    listener as EventListener,
    eventOptions,
  );
  // Return the relevant listener remover to allow clearing it later
  return Function.prototype.bind.call(
    HTMLElement.prototype.removeEventListener,
    target,
    type,
    listener,
    eventOptions,
  );
}

/**
 * Perform `addEvent` multiple times and return the results combined as an array.
 *
 * @param ...queries - Array of addEvent queries.
 * @returns Array of listener removers.
 */
function addEvents<T extends EventBindable>(
  ...queries: AddEventQuery<T>[]
): (() => void)[] {
  return queries.map(query => addEvent(query));
}

/**
 * Add an event listener for all elements matching the `delegate` selector
 * within the `root` element tree, and return the event remover function\
 * for the attached listener to be able to clear it later.
 *
 * @param query
 * @param query.root - The element that we attach the listener to.
 * @param query.type - The event type to listen to.
 * @param query.delegate - Selector for the elements that the listener is actually distributed to.
 * @param query.listener - The event handler function.
 * @param query.options - The event options.
 * @returns Remover for the attached listener.
 */
function delegateEvent<T extends EventDelegatable>({
  root,
  type,
  delegate,
  listener,
  options,
}: DelegateEventQuery<T>): () => void {
  const delegatedListener: EventListener = ({ target }) => {
    // In case event target is a decendant element of the delegated target element,
    // find closest ancestor element that matches the `delegate` selector.
    const delegatedTarget = getClosestElement(
      target as HTMLElement,
      delegate,
      root,
    );
    // Run the callback if the event target is the delegated target.
    if (delegatedTarget) {
      listener.call(null, event, delegatedTarget);
    }
  };
  // Add event listener, and return its remover.
  return addEvent({ target: root, type, listener: delegatedListener, options });
}

export { addEvent, addEvents, delegateEvent };
