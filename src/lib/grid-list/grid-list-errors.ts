import {MatError} from '@angular2-material/core';

/**
 * Exception thrown when cols property is missing from grid-list
 */
export class MatGridListColsError extends MatError {
  constructor() {
    super(`mat-grid-list: must pass in number of columns. Example: <mat-grid-list cols="3">`);
  }
}

/**
 * Exception thrown when a tile's colspan is longer than the number of cols in list
 */
export class MatGridTileTooWideError extends MatError {
  constructor(cols: number, listLength: number) {
    super(`mat-grid-list: tile with colspan ${cols} is wider than grid with cols="${listLength}".`);
  }
}

/**
 * Exception thrown when an invalid ratio is passed in as a rowHeight
 */
export class MatGridListBadRatioError extends MatError {
  constructor(value: string) {
    super(`mat-grid-list: invalid ratio given for row-height: "${value}"`);
  }
}
