import type { UserClassNameFormat } from './classNames';
import type { ElementLike, MultipleElementLike } from './helpers';
import type { UserOptions } from './options';

// Accepted parameter representing an element or multiple elements.
// Used as the type of 1st parameter for Kineto methods.
export type ElementParameter = ElementLike | MultipleElementLike;

// Accepted internal event types for `Kineto.on()` method.
export type PublicEventTypes = 'change' | 'changed' | 'destroy' | 'init';

// Type describing an unknown function that is passed as event handler to `Kineto.on()` method.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PublicEventListener = (...args: any[]) => void;

// Kineto's external API
export interface API {
  setClassFormat(userFormat: UserClassNameFormat): API;
  setDefaults(userDefaults: UserOptions): API;
  create(
    containerSelector: ElementLike | MultipleElementLike,
    userOptions?: UserOptions,
  ): API;
  destroy(container: ElementParameter): API;
  goTo(container: ElementParameter, targetIndex: number): API;
  next(container: ElementParameter): API;
  previous(container: ElementParameter): API;
  refresh(container: ElementParameter): API;
  addSlide(
    container: ElementParameter,
    contents: string | string[],
    position?: number,
  ): API;
  removeSlide(
    container: ElementParameter,
    position?: number,
    deleteCount?: number,
  ): API;
  replaceSlides(container: ElementParameter, contents: string | string[]): API;
  play(container: ElementParameter): API;
  pause(container: ElementParameter): API;
  on(
    container: ElementParameter,
    type: PublicEventTypes,
    listener: PublicEventListener,
  ): API;
  off(
    container: ElementParameter,
    type: PublicEventTypes,
    listener: PublicEventListener,
  ): API;
}
