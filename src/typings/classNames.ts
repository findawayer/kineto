// Schema of `classNames` object
export type ClassNames = {
  container: string;
  frame: string;
  scope: string;
  slide: string;
  slideActive: string;
  slideVisible: string;
  arrows: string;
  arrowsButton: string;
  arrowsButtonActive: string;
  arrowsButtonDisabled: string;
  arrowsButtonPrevious: string;
  arrowsButtonNext: string;
  arrowsIcon: string;
  count: string;
  countCurrent: string;
  countDivider: string;
  countTotal: string;
  pagination: string;
  paginationButton: string;
  paginationButtonActive: string;
  paginationButtonText: string;
  horizontal: string;
  vertical: string;
  responsive: string;
  init: string;
  animating: string;
  playing: string;
  swiping: string;
};

// Available className formatting rules
export type ClassNameFormat = 'BEM' | 'kebabcase';

// Custom className formatting function
export type ClassNameFormatter = (
  block: string,
  element?: string[],
  modifier?: string,
) => string;

// Accepted types for the parameter of `Kineto.setClassFormat()` method.
export type UserClassNameFormat = ClassNameFormat | ClassNameFormatter;

// Parameter of formatting function
export type ClassNameQuery = {
  element?: string | string[];
  modifier?: string;
};
