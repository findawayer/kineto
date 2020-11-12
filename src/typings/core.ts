import type { ClassNames } from './classNames';
import type {
  Animation,
  Arrows,
  Count,
  Pagination,
  Responsive,
  Stream,
  StreamOptions,
  Swipe,
  Wheel,
} from './components';
import type { Container, Frame, Scope, Slide } from './elements';
import type { BaseOptions, Options, ResponsiveOptions } from './options';

// Id for a Kineto instance
export type KinetoId = string;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type KinetoEvent = (...args: any[]) => void;

export interface KinetoEventMap {
  animate: KinetoEvent;
  animated: KinetoEvent;
  animatestop: KinetoEvent;
  change: KinetoEvent;
  changed: KinetoEvent;
  config: KinetoEvent;
  destroy: KinetoEvent;
  init: KinetoEvent;
  interact: KinetoEvent;
  interacted: KinetoEvent;
  lengthchange: KinetoEvent;
  lengthchanged: KinetoEvent;
  pause: KinetoEvent;
  passivechange: KinetoEvent;
  refresh: KinetoEvent;
  resume: KinetoEvent;
}

export type KinetoEventRef = { listener: KinetoEvent; once: boolean };

export type KinetoEvents = Record<string, KinetoEventRef[]>;

// Options for `refresh` method.
export type RefreshOptions = {
  keepLayout?: boolean;
};

// Options for `goTo` method.
export type GoToOptions = {
  passive?: boolean;
  rewind?: boolean;
};

export type UpdateIndexOptions = {
  passive?: boolean;
};

// Interface of class Kineto
export interface KinetoInterface {
  readonly id: KinetoId;
  readonly classNames: ClassNames;
  readonly containerElement: HTMLElement;
  readonly baseOptions: BaseOptions;
  options: Options;
  currentIndex: number;
  syncId: string;
  alignFactor: number;
  isInit: boolean;
  isLooped: boolean;
  isVertical: boolean;
  // Elements
  container: Container;
  frame: Frame;
  scope: Scope;
  slide: Slide;
  // Internal event map
  // Required components
  animation: Animation;
  responsive: Responsive;
  // Optional components
  arrows?: Arrows;
  count?: Count;
  pagination?: Pagination;
  stream?: Stream;
  swipe?: Swipe;
  wheel?: Wheel;
  // Methods
  init(): void;
  destroy(): void;
  config(optionChanges?: ResponsiveOptions): void;
  connect(): void;
  disconnect(): void;
  refresh(options?: RefreshOptions): void;
  goTo(targetIndex: number, options?: GoToOptions): void;
  updateIndex(nextIndex: number, options?: UpdateIndexOptions): void;
  previous(options?: GoToOptions): void;
  next(options?: GoToOptions): void;
  getTargetIndex(direction?: -1 | 0 | 1): number;
  on<T extends KinetoEvent>(type: string, listener: T, once?: boolean): T;
  once<T extends KinetoEvent>(type: string, listener: T): T;
  off(type: string, listener?: KinetoEvent): void;
  emit(type: string, ...args: unknown[]): void;
  addStateClass(state: string, element?: HTMLElement): void;
  removeStateClass(state: string, element?: HTMLElement): void;
  addSlide(contents: string | string[], position?: number): void;
  removeSlide(position?: number, deleteCount?: number): void;
  replaceSlides(contents: string | string[]): void;
  hasNextSlide(index?: number): boolean;
  hasPreviousSlide(index?: number): boolean;
  play(): void;
  pause(options?: StreamOptions): void;
  resume(options?: StreamOptions): void;
}

// Components
export interface Component {
  name: string;
  init: KinetoEvent;
  destroy: KinetoEvent;
  test?: string | string[] | ((app: KinetoInterface) => boolean);
  bind?: Record<string, KinetoEvent>;
  on?: Record<string, KinetoEvent | KinetoEvent[]>;
}

// Single argument for `mount` function.
export interface MountQuery {
  app: KinetoInterface;
  component: Component;
  force?: boolean;
}

// Single argument for `mountAll` function.
export interface MountAllQuery extends Omit<MountQuery, 'component'> {
  components: Record<string, Component>;
}
