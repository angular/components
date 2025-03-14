/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, Input, ViewEncapsulation} from '@angular/core';
import {MatButtonAppearance, MatButtonBase} from './button-base';

/**
 * Classes that need to be set for each appearance of the button.
 * Note that we use a `Map` here to avoid issues with property renaming.
 */
const APPEARANCE_CLASSES: Map<MatButtonAppearance, readonly string[]> = new Map([
  ['text', ['mat-mdc-button']],
  ['filled', ['mdc-button--unelevated', 'mat-mdc-unelevated-button']],
  ['elevated', ['mdc-button--raised', 'mat-mdc-raised-button']],
  ['outlined', ['mdc-button--outlined', 'mat-mdc-outlined-button']],
]);

/**
 * Material Design button component. Users interact with a button to perform an action.
 * See https://m3.material.io/components/buttons/overview
 */
@Component({
  selector: `
    button[matButton], a[matButton], button[mat-button], button[mat-raised-button],
    button[mat-flat-button], button[mat-stroked-button], a[mat-button], a[mat-raised-button],
    a[mat-flat-button], a[mat-stroked-button]
  `,
  templateUrl: 'button.html',
  styleUrls: ['button.css', 'button-high-contrast.css'],
  host: {
    'class': 'mdc-button',
  },
  exportAs: 'matButton, matAnchor',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatButton extends MatButtonBase {
  /** Appearance of the button. */
  @Input('matButton')
  get appearance(): MatButtonAppearance | null {
    return this._appearance;
  }
  set appearance(value: MatButtonAppearance | '') {
    // Allow empty string so users can do `<button matButton></button>`
    // without having to write out `="text"` every time.
    this.setAppearance(value || this._config?.defaultAppearance || 'text');
  }
  private _appearance: MatButtonAppearance | null = null;

  constructor(...args: unknown[]);

  constructor() {
    super();
    const inferredAppearance = _inferAppearance(this._elementRef.nativeElement);

    // Only set the appearance if we managed to infer it from the static attributes, rather than
    // doing something like `setAppearance(inferredAppearance || 'text')`, because doing so can
    // cause the fallback appearance's classes to be set and then immediately replaced when
    // the input value is assigned.
    if (inferredAppearance) {
      this.setAppearance(inferredAppearance);
    }
  }

  /** Programmatically sets the appearance of the button. */
  setAppearance(appearance: MatButtonAppearance): void {
    if (appearance === this._appearance) {
      return;
    }

    const classList = this._elementRef.nativeElement.classList;
    const previousClasses = this._appearance ? APPEARANCE_CLASSES.get(this._appearance) : null;
    const newClasses = APPEARANCE_CLASSES.get(appearance)!;

    if ((typeof ngDevMode === 'undefined' || ngDevMode) && !newClasses) {
      throw new Error(`Unsupported MatButton appearance "${appearance}"`);
    }

    if (previousClasses) {
      classList.remove(...previousClasses);
    }

    classList.add(...newClasses);
    this._appearance = appearance;
  }
}

/** Infers the button's appearance from its static attributes. */
function _inferAppearance(button: HTMLElement): MatButtonAppearance | null {
  if (button.hasAttribute('mat-raised-button')) {
    return 'elevated';
  }

  if (button.hasAttribute('mat-stroked-button')) {
    return 'outlined';
  }

  if (button.hasAttribute('mat-flat-button')) {
    return 'filled';
  }

  if (button.hasAttribute('mat-button')) {
    return 'text';
  }

  return null;
}

// tslint:disable:variable-name
/**
 * Material Design button component for anchor elements. Anchor elements are used to provide
 * links for the user to navigate across different routes or pages.
 * See https://m3.material.io/components/buttons/overview
 */
export const MatAnchor = MatButton;
export type MatAnchor = MatButton;
// tslint:enable:variable-name
