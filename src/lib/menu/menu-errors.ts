import {MatError} from '@angular2-material/core';

/**
 * Exception thrown when menu trigger doesn't have a valid mat-menu instance
 */
export class MatMenuMissingError extends MatError {
  constructor() {
    super(`mat-menu-trigger: must pass in an mat-menu instance.

    Example:
      <mat-menu #menu="matMenu"></mat-menu>
      <button [mat-menu-trigger-for]="menu"></button>
    `);
  }
}

/**
 * Exception thrown when menu's x-position value isn't valid.
 * In other words, it doesn't match 'before' or 'after'.
 */
export class MatMenuInvalidPositionX extends MatError {
  constructor() {
    super(`x-position value must be either 'before' or after'.
      Example: <mat-menu x-position="before" #menu="matMenu"></mat-menu>
    `);
  }
}

/**
 * Exception thrown when menu's y-position value isn't valid.
 * In other words, it doesn't match 'above' or 'below'.
 */
export class MatMenuInvalidPositionY extends MatError {
  constructor() {
    super(`y-position value must be either 'above' or below'.
      Example: <mat-menu y-position="above" #menu="matMenu"></mat-menu>
    `);
  }
}
