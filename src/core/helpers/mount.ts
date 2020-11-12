import { eachValueKey } from 'helpers';
import type { MountQuery, MountAllQuery } from 'typings';

/**
 * Mount a `component` to `app`. This adds a new member named `component.name`
 * to the `app` class.
 *
 * @param arg
 * @param arg.app - The target class that the component should be mounted.
 * @param arg.component - The component to mount.
 */
export function mount({ app, component }: MountQuery): void {
  const { name, bind, init, on } = component;
  // Skip if already mounted
  if (app[name]) {
    return;
  }
  // Create an object value in `name` key inside the Kineto instance.
  app[name] = app[name] || {};
  // Add functions in `bind` object, making their context refers to the instance.
  if (bind) {
    eachValueKey(bind, (method, methodName) => {
      app[name][methodName] = method.bind(app);
    });
  }
  // Attach app-wide event listeners.
  if (on) {
    eachValueKey(on, (listener, eventType) => {
      if (Array.isArray(listener)) {
        listener.forEach(singleListener => {
          app.on(eventType, singleListener);
        });
      } else {
        app.on(eventType, listener);
      }
    });
  }
  // Automatically run `init` function.
  init.call(app);
  // [DEBUG]
  console.debug(`✅ [ID:${app.id}] Mounted [${name}] component.`);
}

/**
 * Unmount a `component` from `app`. This removes all side effects from `mount`.
 *
 * @param arg
 * @param arg.component - The component to unmount.
 * @param arg.force - Whether to unmount regardless current mount state.
 *                              Currently not in use.
 */
export function unmount({ app, component }: MountQuery): void {
  const { name, destroy, on } = component;
  // Skip if not mounted
  if (!app[name]) {
    return;
  }
  // Throw if the component is missing `destroy` function.
  if (typeof destroy !== 'function') {
    throw new Error(`Optional component ${name} is missing destroy function.`);
  }
  // Remove app-wide listeners.
  if (on) {
    eachValueKey(on, (listener, eventType) => {
      if (Array.isArray(listener)) {
        listener.forEach(singleListener => {
          app.off(eventType, singleListener);
        });
      } else {
        app.off(eventType, listener);
      }
    });
  }
  // Call destroy function
  destroy.call(app);
  // Remove compenent references from class
  delete app[name];
  // [DEBUG]
  console.debug(`❌ [ID:${app.id}] Unmounted [${name}] component.`);
}

/**
 * Test if the `component` should be mounted using the `test` value of the component.
 *
 * @param arg
 * @param arg.app - The Kineto instance to mount the component to.
 * @param arg.component - The component to test.
 * @returns Whether the component is good to mount.
 */
function shouldMount({ app, component: { test }, force }: MountQuery): boolean {
  if (typeof force === 'boolean') {
    return force;
  }
  const { options } = app;

  switch (typeof test) {
    // [case] undefined: Test value omitted; the component is always mounted.
    case 'undefined':
      return true;

    // [case] string: The component should be mounted when the option
    // matching the `test` key has truthy value.
    case 'string':
      return !!options[test];

    // [case] function: The component should be mounted when the test function
    // receiving Kineto instance as parameter, returns truthy value.
    case 'function':
      return test(app);

    default:
      // [case] array of strings: The component should be mounted when an option
      // matching one of the keys in the `test` array has truthy value.
      if (Array.isArray(test)) {
        return test.some(key => !!options[key]);
      }
      // Unexpected test value.
      throw new Error('Unexpected test value.');
  }
}

/**
 * Mount or unmount a `component` based on values in `options` member in the `app`.
 *
 * @param arg
 * @param arg.app - The class which the component should be mounted to/unmounted from.
 * @param arg.component - The component to unmount.
 */
export function toggleMount({ app, component, force }: MountQuery): void {
  if (shouldMount({ app, component, force })) {
    mount({ app, component });
  } else {
    unmount({ app, component });
  }
}

/**
 * Multiple components version of `toggleMount` above.
 *
 * @param arg
 * @param arg.app - The class which the component should be mounted to/unmounted from.
 * @param arg.components - The component to unmount.
 */
export function toggleMountAll({
  app,
  components,
  force,
}: MountAllQuery): void {
  eachValueKey(components, component => {
    toggleMount({ app, component, force });
  });
}
