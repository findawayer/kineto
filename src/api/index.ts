import Kineto from 'core';
import { inArray, onEachElement } from 'helpers';
import { getInstanceByContainer } from 'store';
import type {
  API,
  ElementParameter,
  PublicEventListener,
  PublicEventTypes,
  UserClassNameFormat,
  UserOptions,
} from 'typings';
import { setClassFormat } from 'core/classnames';
import { setDefaultOptions } from 'core/options';

const publicEventTypes = ['change', 'changed', 'destroy', 'init'];

/**
 * Find Kineto instance with container element provided, and call a public method.
 *
 * @param query
 * @param query.container - The container element or its selector.
 * @param query.method - The name of the method to invoke.
 * @param query.parameters - Optional parameters to pass to the method.
 */
function call({
  container,
  method,
  parameters,
}: {
  container: ElementParameter;
  method: string;
  parameters?: unknown[];
}): void {
  onEachElement(container, element => {
    const kineto = getInstanceByContainer(element);
    if (!kineto) {
      throw new Error('No Kineto instance found on the element passed.');
    }
    if (parameters) {
      kineto[method](...parameters);
    } else {
      kineto[method]();
    }
  });
}

/**
 * @overview
 * Kineto API. All members:
 * - Are to be exposed to global namespace.
 * - Are designed to support chaining method calls.
 */
const api: API = {
  /**
   * Configure CSS classes for all Kineto instances. Expects a string
   * representing class methodology, or a custom formatter function as parameter.
   *
   * @param userFormat - Formating method for CSS classes.
   * @returns The API object to support chaining method calls.
   */
  setClassFormat(userFormat: UserClassNameFormat): API {
    setClassFormat(userFormat);
    return api;
  },

  /**
   * Configure globally-used default options with custom values.
   *
   * @param userOptions - User-defined default options overriding `defaultOptions`.
   * @returns The API object to support chaining method calls.
   */
  setDefaults(userDefaults: UserOptions): API {
    setDefaultOptions(userDefaults);
    return api;
  },

  /**
   * Instantiate Kineto on elements that match the selector passed.
   *
   * @param container - The container element or its selector.
   * @param userOptions - User options to pass to the constructor.
   * @returns The API object to support chaining method calls.
   */
  create(container: ElementParameter, userOptions?: UserOptions): API {
    // Find the container matching the selector passed.
    onEachElement(container, element => {
      // Make sure if Kineto has not been created onto the same container
      if (getInstanceByContainer(element)) {
        return;
      }
      // Create new Kineto instance
      const kineto = new Kineto(element, userOptions);
      // Init automatically
      kineto.init();
      // [DEBUG]
      console.debug(`💡 New Kineto id: ${kineto.id}`, kineto);
    });
    return api;
  },

  /**
   * Destroy an existing Kineto instance from the container passed.
   *
   * @param container - Container element of the instance we want to control.
   * @returns The API object to support chaining method calls.
   */
  destroy(container: ElementParameter) {
    call({ container, method: 'destroy' });
    return api;
  },

  /**
   * Make a Kineto instance move to a slide by index.
   *
   * @param container - Container element of the instance we want to control.
   * @param targetIndex - Index of the slide we want to move to.
   * @returns The API object to support chaining method calls.
   */
  goTo(container: ElementParameter, targetIndex: number): API {
    call({
      container,
      method: 'goTo',
      parameters: [targetIndex],
    });
    return api;
  },

  /**
   * Make a Kineto instance move to the next slide.
   *
   * @param container - Container element of the instance we want to control.
   * @returns The API object to support chaining method calls.
   */
  next(container: ElementParameter): API {
    call({ container, method: 'next' });
    return api;
  },

  /**
   * Make a Kineto instance move to the previous slide.
   *
   * @param container - Container element of the instance we want to control.
   * @returns The API object to support chaining method calls.
   */
  previous(container: ElementParameter): API {
    call({ container, method: 'previous' });
    return api;
  },

  /**
   * Make a Kineto instance reload and recalculate layout. This can be used
   * after manipulating slide content that affects the layout.
   *
   * @param container - Container element of the instance we want to control.
   * @returns The API object to support chaining method calls.
   */
  refresh(container: ElementParameter): API {
    call({ container, method: 'refresh' });
    return api;
  },

  /**
   * Add a new slide with given content string, at a specific position.
   *
   * @param container - Container element of the instance we want to control.
   * @param contents - HTML string representing the content the new slide.
   * @param position - The position where the new slide should be inserted at.
   * @returns The API object to support chaining method calls.
   */
  addSlide(
    container: ElementParameter,
    contents: string | string[],
    position?: number,
  ): API {
    call({ container, method: 'addSlide', parameters: [contents, position] });
    return api;
  },

  /**
   * Remove existing slide(s) from a specific position.
   *
   * @param container - Container element of the instance we want to control.
   * @param position - The index at which to remove slides. Negative integer will select from the end.
   * @param deleteCount - The number of slides to remove from `position`.
   * @returns The API object to support chaining method calls.
   */
  removeSlide(
    container: ElementParameter,
    position?: number,
    deleteCount?: number,
  ): API {
    call({
      container,
      method: 'removeSlide',
      parameters: [position, deleteCount],
    });
    return api;
  },

  /**
   * Replace existing slides with new ones.
   *
   * @param contents - Content HTML for the new slide(s).
   * @returns The API object to support chaining method calls.
   */
  replaceSlides(container: ElementParameter, contents: string | string[]): API {
    call({ container, method: 'replaceSlides', parameters: [contents] });
    return api;
  },

  /**
   * Start auto-rotating. This will be effective regardless initial `streamEvery` settings.
   *
   * @param container - Container element of the instance we want to control.
   * @returns The API object to support chaining method calls.
   */
  play(container: ElementParameter): API {
    call({ container, method: 'play' });
    return api;
  },

  /**
   * Stop auto-rotating.
   *
   * @param container - Container element of the instance we want to control.
   * @returns The API object to support chaining method calls.
   */
  pause(container: ElementParameter): API {
    call({ container, method: 'pause' });
    return api;
  },

  /**
   * Add an event listener to a Kineto's internal event that matches the type passed.
   *
   * @param container - Container element of the instance we want to control.
   * @param type - The name of the event to listen to.
   * @param listener - The event handler to bind.
   * @returns The API object to support chaining method calls.
   */
  on(
    container: ElementParameter,
    type: PublicEventTypes,
    listener: PublicEventListener,
  ): API {
    if (!type || !listener) {
      throw new Error('Event type and listener should be provided.');
    }
    // Runtime type guard
    if (!inArray(type, publicEventTypes)) {
      throw new Error(`${type} is not a valid event type.`);
    }
    call({ container, method: 'on', parameters: [type, listener] });
    return api;
  },

  /**
   * Add an event listener to a Kineto's internal event that matches the type passed.
   *
   * @param container - Container element of the instance we want to control.
   * @param type - The name of the event to remove.
   * @param listener - The event handler to unbind.
   * @returns The API object to support chaining method calls.
   */
  off(
    container: ElementParameter,
    type: PublicEventTypes,
    listener: PublicEventListener,
  ): API {
    if (!type || !listener) {
      throw new Error('Event type and listener should be provided.');
    }
    // Runtime type guard
    if (!inArray(type, publicEventTypes)) {
      throw new Error(`${type} is not a valid event type.`);
    }
    call({ container, method: 'off', parameters: [type, listener] });
    return api;
  },
};

export default api;
