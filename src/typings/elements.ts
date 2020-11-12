// Container component
export interface Container {
  element: HTMLElement;
  initialStyle: string;
  height: number;
  size: number;
  offset: number;
  measure: () => void;
  resize: () => void;
}

// Query to update loop matrix of slides
export type SlideLoopQuery = {
  factor: number;
  indice: number[];
  range: number;
};

// Slide component
export interface Slide {
  elements: HTMLElement[];
  length: number;
  initialStyles: string[];
  classNameTemplate: string;
  loopMatrix: number[];
  sizes: number[];
  heights: number[];
  maxHeight: number;
  anchors: number[];
  offsets: number[];
  positions: number[];
  totalSize: number;
  spacePerSlide: number;
  visibleIndice: number[];
  whollyVisibleIndice: number[];
  loopBackward: SlideLoopQuery;
  loopForeward: SlideLoopQuery;
  removeListener?: () => void;
  config: () => void;
  measure: () => void;
  resize: () => void;
  reposition: () => void;
  connect: () => void;
  add: (content: string, index?: number) => void;
  remove: (index?: number, deleteCount?: number) => void;
  setupLoop: () => void;
  updateCurrent: (currentIndex: number, previousIndex?: number) => void;
  updateVisibility: () => void;
  updateLoop: (query: { translate: number }) => void;
  handleClick: (event: MouseEvent) => void;
}

// Frame component
export interface Frame {
  element: HTMLElement;
  height: number;
  config: () => void;
  resize: () => void;
  connect: () => void;
}

// Query to render Scope component
export type ScopeRenderQuery = {
  translate: number;
  isAnimating?: boolean;
};

// Scope component
export interface Scope {
  element: HTMLElement;
  range: number;
  translate: number;
  maxTranslate: number;
  minTranslate: number;
  snap: number[];
  reposition: () => void;
  connect: () => void;
  render: (query: ScopeRenderQuery) => void;
  setupMatrix: () => void;
}
