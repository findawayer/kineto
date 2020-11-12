import components, {
  requiredComponents,
  optionalComponents,
  responsive,
} from 'components';
import {
  addClass,
  clamp,
  detachElement,
  eachValueKey,
  findInArray,
  findIndexInArray,
  hasKey,
  isObject,
  modulo,
  prependElementTree,
  removeClass,
  times,
} from 'helpers';
import { register, unregister, toggleSync, isSyncBase } from 'store';
// Prevent collision of namespace
import { ModeOption } from 'typings';
import type * as Type from 'typings';
import { classNames } from './classnames';
import { generateId, mount, toggleMountAll } from './helpers';
import {
  getAlignFactor,
  parseSyncId,
  createBaseOptions,
  createResponsiveOptions,
} from './options';

/**
 * @constuctor
 * This is the main class that sets up the carousel on the requested DOM element
 * with the options given. It contains app's static data, generic states and
 * components in use as its member.
 */
export default class Kineto implements Type.KinetoInterface {
  // Value that the store uses to find a specific instance.
  readonly id: string = generateId();
  // Selector of the container element that user initially provides.
  readonly containerElement: HTMLElement;
  // Source options that custom augmentations are based onto.
  readonly baseOptions: Type.BaseOptions;
  // CSS classes map
  readonly classNames = classNames;
  // Actual app settings that are used for operations.
  options: Type.Options;
  // Index of currently active slide.
  currentIndex: number;
  // Memoized values
  syncId: string;
  alignFactor: number;
  isInit = false;
  isLooped: boolean;
  isVertical: boolean;
  // Elements
  container: Type.Container;
  frame: Type.Frame;
  scope: Type.Scope;
  slide: Type.Slide;
  // Required components
  animation: Type.Animation;
  responsive: Type.Responsive;
  // Optional components
  arrows?: Type.Arrows;
  count?: Type.Count;
  pagination?: Type.Pagination;
  stream?: Type.Stream;
  swipe?: Type.Swipe;
  wheel?: Type.Wheel;
  // Map of events registered through internal event emitter.
  private events: Type.KinetoEvents = {};

  /**
   * Define static members that do not change during initialization. Other members
   * of the class will be augmented as soon as we are done parsing user-defined options
   * passed as parameter.
   *
   * @constructs Kineto
   * @param containerSelector - Selector or the element itself of the container.
   * @param userOptions - User defined options.
   */
  constructor(container: HTMLElement, userOptions?: Type.UserOptions) {
    // Merge user options with defaults and fix conflicts.
    const baseOptions = createBaseOptions(userOptions);
    this.containerElement = container;
    this.baseOptions = baseOptions;
    this.currentIndex = baseOptions.startAt;
  }

  /**
   * Build the layout and enable functionalities. `Kineto.create()` method will
   * automatically call this method after creating an instance.
   */
  init(): void {
    // Prevent duplicate call
    if (this.isInit) {
      return;
    }
    // If user has provided responsive options, mount responsive component first
    // and construct current options according to the actual viewport size.
    if (isObject(this.baseOptions.responsive)) {
      mount({ app: this, component: responsive });
      this.responsive.updateOptions();
    }
    // Use raw `baseOptions` if no responsive options provided
    else {
      this.config();
    }
    // Restructure DOM elements
    this.connect();
    // Register the instance to the global store
    register(this);
    // Send `init` signal to tell the components to initialize.
    this.emit('init');
    // Add state class
    this.addStateClass('init');
    // Set init flag. (This should be done at the very end, so the components
    // can distinguish we are still halfway through the init process.)
    this.isInit = true;
  }

  /**
   * Reset all side effects made during `init` process above.
   */
  destroy(): void {
    // Prevent duplicate call
    if (!this.isInit) {
      return;
    }
    // Unsync instance
    toggleSync(this, false);
    // Unregister instance from the store
    unregister(this);
    // Revert DOM structure
    this.disconnect();
    // Remove `init` className
    this.removeStateClass('init');
    // Remove mode className
    eachValueKey(ModeOption, mode => this.removeStateClass(mode));
    // Unmount all components
    toggleMountAll({ app: this, components, force: false });
    // Dispatch event
    this.emit('destroy');
    // Turn init flag off.
    this.isInit = false;
  }

  /**
   * Configure Kineto settings. This can be used to override current settings
   * with custom modifications; (e.g. `responsive` component calls this method
   * internally to update settings.)
   *
   * @param optionChanges - Object containing modifications to the options.
   */
  config(optionChanges?: Type.ResponsiveOptions): void {
    // Cache old options
    const currentOptions = this.options;
    // Merge base options with the changes provided.
    const nextOptions = createResponsiveOptions(
      this.baseOptions,
      optionChanges,
    );
    const syncId = parseSyncId(nextOptions.syncId);
    const alignFactor = getAlignFactor(nextOptions.align);
    // Add the merged options to instance
    this.options = nextOptions;
    // Memoize expressions
    this.syncId = syncId;
    this.alignFactor = alignFactor;
    // Shorten frequently used expressions
    this.isLooped = !!nextOptions.loop;
    this.isVertical = nextOptions.mode === ModeOption.Vertical;
    // Install required components on initialization
    if (!this.isInit) {
      toggleMountAll({
        app: this,
        components: requiredComponents,
        force: true,
      });
    }
    // Mount/unmount optional components using the options
    toggleMountAll({ app: this, components: optionalComponents });
    // Update sync state between instances
    toggleSync(this, !!syncId);
    // Toggle mode CSS class
    eachValueKey(ModeOption, mode => {
      if (mode === nextOptions.mode) {
        this.addStateClass(mode);
      } else {
        this.removeStateClass(mode);
      }
    });
    // Send signal to the components to update their own settings.
    // Pass both new/old options as parameter, to let them decide how they should react.
    this.emit('config', nextOptions, currentOptions);
    // Re-adjust sizes/positions of elements
    this.refresh();
  }

  /**
   * Insert elements into the DOM.
   */
  connect(): void {
    const { container, frame, scope, slide } = this;
    // Put the slides into the scope.
    slide.elements.forEach(element => {
      scope.element.appendChild(detachElement(element));
    });
    // Put the scope into the frame.
    frame.element.appendChild(scope.element);
    // Put the frame into the container.
    prependElementTree(frame.element, container.element);
  }

  /**
   * Insert elements into the DOM.
   */
  disconnect(): void {
    const { container, frame, slide } = this;
    // Put the slides into the scope.
    slide.elements.forEach(element => {
      container.element.appendChild(detachElement(element));
    });
    // Put the scope into the frame.
    detachElement(frame.element);
  }

  /**
   * Re-calculate element sizes and positions, then re-render.
   *
   * @param options
   * @param options.keepLayout - Prevent resetting container size. This is useful
   *   when you want to update the sizes but don't want the container shrink or
   *   grow in vertical mode.
   */
  refresh({ keepLayout }: { keepLayout?: boolean } = {}): void {
    const { container, frame, isLooped, scope, slide } = this;
    // Get initial size of the container and the slides.
    if (!keepLayout) {
      container.measure();
    }
    slide.measure();
    // Resize elements
    container.resize();
    slide.resize();
    frame.resize();
    // TODO: move to refresh handler
    // Setup matrix
    scope.setupMatrix();
    if (isLooped) {
      slide.setupLoop();
    }
    // Reposition elements
    scope.reposition();
    slide.reposition();
    // Send `refresh` signal
    this.emit('refresh');
  }

  /**
   * Go to a different slide, targeted by the passed index. Attempts to move to
   * the same index are ignored — in this case, use `restore()` method instead.
   *
   * @param targetIndex - Index of the destination slide.
   * @param options
   * @param options.passive - Flag telling this action is triggered by the global store
                              in order to get instances in sync.
   * @param options.rewind - Go back to the first slide on the last one.
   */
  goTo(targetIndex: number, { passive, rewind }: Type.GoToOptions = {}): void {
    const {
      currentIndex,
      isLooped,
      scope,
      slide,
      options: { waitAnimation },
    } = this;
    // Handle overflow & underflow based on the settings
    const nextIndex =
      isLooped || rewind
        ? modulo(targetIndex, slide.length)
        : clamp(targetIndex, 0, slide.length - 1);
    // Skip request if there is no changes
    if (nextIndex === currentIndex) {
      return;
    }
    // Skip incoming `goTo` requests while animation is active
    // if `waitAnimation` option is set.
    if (waitAnimation && this.animation.isActive) {
      return;
    }
    // Find destination translate of the animation
    const targetTranslate = scope.snap[nextIndex];
    // Update current index
    this.updateIndex(nextIndex, { passive });
    // Figure out in which way the scope should loop
    if (isLooped) {
      const delta = Math.abs(nextIndex - currentIndex);
      const forewardDelta = Math.abs(nextIndex - slide.length - currentIndex);
      const backwardDelta = Math.abs(nextIndex + slide.length - currentIndex);
      // Loop the scope foreward/backward
      if (forewardDelta < delta) {
        scope.translate -= scope.range;
      } else if (backwardDelta < delta) {
        scope.translate += scope.range;
      }
    }
    // Trigger the animation
    this.animation.start({ targetTranslate });
  }

  /**
   * Replace current index with the one passed.
   *
   * @param index - The new index to be applied.
   * @param options
   * @param options.passive - Flag telling this action is triggered by the global store
                              in order to get instances in sync.
   */
  updateIndex(index: number, { passive }: Type.UpdateIndexOptions = {}): void {
    const previousIndex = this.currentIndex;
    // Skip request if there is no changes
    if (index === previousIndex) {
      return;
    }
    // Update index
    this.currentIndex = index;
    // Dispatch an event before moving
    this.emit('change', index, previousIndex);
    // `passivechange` is a special event to keep multiple instances in sync.
    // It is designed to prevent infinite event loops that occur when we use
    // `change` event to trigger other instances `goTo` method.
    // Don't use this event for any other purpose.
    if (!passive) {
      this.emit('passivechange', index, previousIndex);
    }
    // Emit `changed` event on animation completion
    const emitChanged = () => {
      this.emit('changed', index, previousIndex);
    };
    // Remove listener in case the animation is stopped
    this.once('animatestop', () => {
      this.off('animated', emitChanged);
    });
    this.on('animated', emitChanged);
  }

  /**
   * Go to the previous index. This invokes `goTo()` method with options passed.
   *
   * @param options - Options to pass to `goTo` method.
   */
  previous(options?: Type.GoToOptions): void {
    this.goTo(this.getTargetIndex(-1), options);
  }

  /**
   * Go to the next index. This invokes `goTo()` method with options passed.
   *
   * @param options - Options to pass to `goTo` method.
   */
  next(options?: Type.GoToOptions): void {
    this.goTo(this.getTargetIndex(1), options);
  }

  /**
   * Get destination index of a movement in the direction passed.
   *
   * @param direction - Integer representing direction of the movement.
   *    0: No movement (default)
   *    1: Foreward movement
   *   -1: Backward movement
   */
  getTargetIndex(direction?: -1 | 0 | 1): number {
    const {
      container,
      currentIndex,
      isLooped,
      options: { margin, moveBy, perView },
      slide,
    } = this;
    if (!direction) {
      return currentIndex;
    }
    if (moveBy === 'auto') {
      // Both `perView` and `moveBy` are set to `auto`;
      // Figure out how many slides to skip to move by 100% frame size.
      // assuming that slides have different sizes.
      if (perView === 'auto') {
        let i = currentIndex;
        let passed = 0;
        do {
          passed += slide.sizes[i] + margin;
          if (passed > container.size) {
            break;
          }
          i += direction;
          if (isLooped) {
            i = modulo(i, slide.length);
          }
        } while (i !== currentIndex);
        return i;
      }
      return currentIndex + Math.floor(perView) * direction;
    }
    return currentIndex + moveBy * direction;
  }

  /**
   * Listen to an internal event of specific `type`, and invoke the passed `listener`
   * when the event is dispatched.
   *
   * @param type - The name of the event to listen to.
   * @param listener - The event handler to bind.
   * @param once - Whether the listener should be removed after being invoked.
   * @returns The passed listener itself to be able to remove them later.
   */
  on<T extends Type.KinetoEvent>(type: string, listener: T, once?: boolean): T {
    const { events } = this;
    // Make sure we don't duplicate listener, if there is an existing list of
    // listeners for the event type passed.
    if (hasKey(events, type)) {
      const listenerExists = !!findInArray(
        events[type],
        ref => ref.listener === listener,
      );
      if (listenerExists) {
        return undefined;
      }
    }
    // Otherwise, create a container for the listener.
    else {
      events[type] = [];
    }
    // Add to the listener list.
    events[type].push({ listener, once: once || false });
    // Return the added listener to facilitate later removal.
    return listener;
  }

  /**
   * Single-use version of the `on` method above; execute passed `listener` handler
   * when the event of `type` passed is emitted, then remove the listener immediately.
   *
   * @param type - The name of the event to listen to.
   * @param listener - The event handler to bind.
   * @returns The passed listener itself to be able to remove them later.
   */
  once<T extends Type.KinetoEvent>(type: string, listener: T): T {
    return this.on(type, listener, true);
  }

  /**
   * Remove event listener from the internal event of the `type`. Remove every
   * registered listener if `listener` parameter is omitted.
   *
   * @param type - The name of the event to remove.
   * @param listener - The event handler to unbind.
   */
  off(type: string, listener?: Type.KinetoEvent): void {
    const { events } = this;
    // Skip if no listener has been registered for the type given.
    if (!hasKey(events, type)) {
      return;
    }
    // Delete all listeners for that type if `listener` is not specified.
    if (!listener) {
      delete events[type];
      return;
    }
    // Delete a specific listener.
    const listenerList = events[type];
    const listenerIndex = findIndexInArray(
      listenerList,
      ref => ref.listener === listener,
    );
    if (listenerIndex !== -1) {
      listenerList.splice(listenerIndex, 1);
    }
  }

  /**
   * Dispatch an internal event.
   *
   * @param type - Name of the event to dispatch.
   * @param parameters - Parameter to pass to the event handler.
   */
  emit(type: string, ...parameters: unknown[]): void {
    const { events } = this;
    // Skip if no listener has been registered for that name.
    if (!hasKey(events, type)) {
      return;
    }
    // console.debug(`🔔 [ID:${this.id}] Emitted [${type}] event.`);
    const eventsByType = events[type];
    eventsByType.forEach(({ listener, once }) => {
      listener.apply(this, parameters);
      if (once) {
        this.off(type, listener);
      }
    });
  }

  /**
   * Add a CSS class to the `element` reflecting important state changes; this allows
   * users customizing styles for a specific state of the app. The state has to be
   * pre-defined in the CSS class schema (@see: core/classnames/schema)
   *
   * @param state - Name of the state to indicate.
   * @param element - The element that the class should be added to.
   */
  addStateClass(state: string, element = this.containerElement): void {
    addClass(element, this.classNames[state]);
  }

  /**
   * Remove an existing CSS class from the `element`. This is used to reset
   * CSS class added by `addStateClass` above.
   *
   * @param state - Name of the state to indicate.
   * @param element - The element that the class should be removed from.
   */
  removeStateClass(state: string, element = this.containerElement): void {
    removeClass(element, this.classNames[state]);
  }

  /**
   * Dynamically add a new slide at a specific position.
   * If `index` is not specified, add it to the end.
   *
   * @param contents - Content for the new slide as HTML string.
   * @param position - The index at which to put the new slide.
   */
  addSlide(contents: string | string[], position = -1): void {
    const { currentIndex, slide } = this;
    const contentsArray = [].concat(contents);
    const currentLength = slide.length;
    const nextLength = currentLength + contentsArray.length;
    const insertIndex = modulo(position, currentLength + 1);
    // Notify components there will be a change in the number of slides.
    // (This will hold auto-playing for safety.)
    this.emit('lengthchange', nextLength, currentLength);
    // Add new slides.
    times(contentsArray.length, index => {
      slide.add(contentsArray[index], insertIndex + index);
    });
    // If the new slides is placed before the current slide,
    // shift current index forward to give impression of staying at the same position.
    if (insertIndex <= currentIndex) {
      this.currentIndex += contentsArray.length;
    }
    // Recalculate matrix and reposition elements
    this.refresh();
    // Notify components we are done changing.
    // (This will resume auto-playing.)
    this.emit('lengthchanged', nextLength, currentLength);
  }

  /**
   * Dynamically remove a slide at a specific position.
   * If `index` is not specified, remove the last slide.
   *
   * @param position - The index at which to remove slides.
   * @param deleteCount - The number of slides to remove from `position`.
   */
  removeSlide(position = -1, deleteCount = 1): void {
    const { currentIndex, slide } = this;
    // Skip if there is no slide left
    if (!slide.length) {
      return;
    }
    const currentLength = slide.length;
    const removeIndex = modulo(position, currentLength);
    const slidesToRemove = Math.min(deleteCount, currentLength - removeIndex);
    const nextLength = currentLength - slidesToRemove;
    // Notify components there will be a change in the number of slides.
    // (This will hold auto-playing for safety.)
    this.emit('lengthchange', nextLength, currentLength);
    // Remove slides.
    slide.remove(removeIndex, slidesToRemove);
    // If the removed slide is the active slide or a precedant one,
    // shift current index backwards to give impression of staying at the same position.
    if (currentIndex && removeIndex < currentIndex) {
      this.currentIndex -= slidesToRemove;
    }
    // Round off-range index
    this.currentIndex = clamp(this.currentIndex, 0, nextLength - 1);
    // Recalculate matrix and reposition elements, while preventing the container from
    // growing or shrinking in vertical mode.
    this.refresh({ keepLayout: true });
    // Notify components we are done changing.
    // (This will resume auto-playing.)
    this.emit('lengthchanged', nextLength, currentLength);
  }

  /**
   * Replace existing slides with new ones.
   *
   * @param contents - Content HTML for the new slide(s).
   */
  replaceSlides(contents: string | string[]): void {
    const { slide } = this;
    const currentLength = slide.length;
    const contentsArray = [].concat(contents);
    const nextLength = contentsArray.length;
    // Notify components there will be a change in the number of slides.
    // (This will hold auto-playing for safety.)
    this.emit('lengthchange', nextLength, currentLength);
    // Remove existing slides
    if (currentLength) {
      slide.remove(0, currentLength);
    }
    // Then add new slides
    contentsArray.forEach(content => slide.add(content));
    // Reset current index
    this.currentIndex = 0;
    // Recalculate matrix and reposition elements
    this.refresh({ keepLayout: true });
    // Notify components we are done changing.
    // (This will resume auto-playing.)
    this.emit('lengthchanged', nextLength, currentLength);
  }

  /**
   * Test if the passed `index` is has more slide(s) in foreward direction.
   * A looped instance will always return `true`.
   *
   * @param index - The index to test.
   * @returns Whether there is next slide(s).
   */
  hasNextSlide(index = this.currentIndex): boolean {
    return this.isLooped || index !== this.slide.length - 1;
  }

  /**
   * Test if the passed `index` is has more slide(s) in backward direction.
   * A looped instance will always return `true`.
   *
   * @param index - The index to test.
   * @returns Whether there is previous slide(s).
   */
  hasPreviousSlide(index = this.currentIndex): boolean {
    return this.isLooped || index !== 0;
  }

  // play, pause, resume: shortcuts for stream manipulation;
  // Used to dispatch actions to multiple instances, and to dispose an external API.
  play(): void {
    // Skip if the current instance is synced in a passive manner
    // to avoid duplicate streaming.
    if (this.syncId && !isSyncBase(this)) {
      return;
    }
    this.stream.play();
  }

  pause(options?: Type.StreamOptions): void {
    this.stream.pause(options);
  }

  resume(options?: Type.StreamOptions): void {
    this.stream.resume(options);
  }
}
