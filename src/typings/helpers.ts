// Primitives: arrays --------------------

// Testing function for array.find
export type FindPredicate<T> = (
  currentValue: T,
  index: number,
  originalArray: T[],
) => boolean;

// Primitives: objects --------------------

// Unknown object type
export type UnknownObject = Record<string, unknown>;

// Iterating function for object mapper
export type ObjectIteratee<T, R> = (value: T[keyof T], key: keyof T) => R;

// Iterating function for object testing function
export type ObjectPredicate<T> = (value: T[keyof T], key: keyof T) => boolean;

// Iterating function for object reducer
export type ObjectReducer<I extends UnknownObject, O extends unknown> = (
  accumulator: O,
  value: I[keyof I],
  key: keyof I,
  initialObject: I,
) => O;

// Elements --------------------

// HTML element or element selector
export type ElementLike = HTMLElement | string;

// Multiple HTML elements or selectors
export type MultipleElementLike =
  | NodeList
  | HTMLCollection
  | HTMLElement[]
  | string;

// Event listeners --------------------

// Accepted addEventListener targets
export type EventBindable = Window | Document | HTMLElement;

// Accepted event delegation targets
export type EventDelegatable = Exclude<EventBindable, Window>;

// HTMLElement event map with some legacy events added
interface ProgressiveHTMLElementEventMap extends HTMLElementEventMap {
  mousewheel: WheelEvent;
}

// The type of node on which the event listener in question has been bound
export type EventBoundNode<T extends EventBindable> = T extends Window
  ? Window
  : T extends Document
  ? Document
  : HTMLElement;

// The event map for the node we have bound the event listener in question
export type EventMap<T extends EventBindable> = T extends Window
  ? WindowEventMap
  : T extends Document
  ? DocumentEventMap
  : ProgressiveHTMLElementEventMap;

// Query for `addEvent` method
export type AddEventQuery<T extends EventBindable> = {
  target: EventBoundNode<T>;
  type: keyof EventMap<T>;
  listener: EventListener;
  options?: boolean | AddEventListenerOptions;
};

// Delegated event listener type
interface DelegatedEventListener {
  (event: Event, delegateTarget: HTMLElement): void;
}

// Query for `addEvent` method with delegation option
export type DelegateEventQuery<T extends EventDelegatable> = {
  root: EventBoundNode<T>;
  type: keyof EventMap<T>;
  delegate: string;
  listener: DelegatedEventListener;
  options?: boolean | AddEventListenerOptions;
};

// CSS --------------------

// Query for `toCSSValue` method
export type ToCSSValueQuery = {
  percentBase: number;
  precision: number;
};

// Object holding an element's dimension data
export type ElementSizeData = {
  width: number;
  height: number;
};

// Query for `setTranslate` method
export type TranslateQuery = {
  x?: number;
  y?: number;
  use3d?: boolean;
};

// Events --------------------

// Events that can simulate a swipe
export type SwipeEvent = MouseEvent | TouchEvent;

// Object holding normalized data about a swipe event
export interface SwipeReference {
  readonly id: number;
  readonly x: number;
  readonly y: number;
}
