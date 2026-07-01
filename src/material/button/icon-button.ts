/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, Input, ViewEncapsulation} from '@angular/core';
import {MatButtonBase} from './button-base';

/** Possible appearances for a `MatIconButton`. */
export type MatIconButtonAppearance = 'filled' | 'tonal';

/** Classes that need to be set for each appearance of the icon button. */
const APPEARANCE_CLASSES: Map<MatIconButtonAppearance, readonly string[]> = new Map([
  ['filled', ['mat-mdc-icon-button-filled']],
  ['tonal', ['mat-mdc-icon-button-tonal']],
]);

/**
 * Material Design icon button component. This type of button displays a single interactive icon for
 * users to perform an action.
 * See https://material.io/develop/web/components/buttons/icon-buttons/
 */
@Component({
  selector: `button[mat-icon-button], a[mat-icon-button], button[matIconButton], a[matIconButton]`,
  templateUrl: 'icon-button.html',
  styleUrls: ['icon-button.css', 'button-high-contrast.css'],
  host: {
    'class': 'mdc-icon-button mat-mdc-icon-button',
  },
  exportAs: 'matButton, matAnchor',
  encapsulation: ViewEncapsulation.None,
})
export class MatIconButton extends MatButtonBase {
  /** Appearance of the icon button. */
  @Input('matIconButton')
  get appearance(): MatIconButtonAppearance | null {
    return this._appearance;
  }
  set appearance(value: MatIconButtonAppearance | '') {
    this.setAppearance(value || null);
  }
  private _appearance: MatIconButtonAppearance | null = null;

  /** Same as `appearance`, but using the legacy `mat-icon-button` attribute selector. */
  @Input('mat-icon-button')
  set _legacyAppearance(value: MatIconButtonAppearance | '') {
    this.setAppearance(value || null);
  }

  constructor() {
    super();
    this._rippleLoader.configureRipple(this._elementRef.nativeElement, {centered: true});
  }

  /** Programmatically sets the appearance of the icon button. */
  setAppearance(appearance: MatIconButtonAppearance | null): void {
    if (appearance === this._appearance) {
      return;
    }

    const classList = this._elementRef.nativeElement.classList;
    const previousClasses = this._appearance ? APPEARANCE_CLASSES.get(this._appearance) : null;
    const newClasses = appearance ? APPEARANCE_CLASSES.get(appearance) : null;

    if ((typeof ngDevMode === 'undefined' || ngDevMode) && appearance && !newClasses) {
      throw new Error(`Unsupported MatIconButton appearance "${appearance}"`);
    }

    if (previousClasses) {
      classList.remove(...previousClasses);
    }

    if (newClasses) {
      classList.add(...newClasses);
    }

    this._appearance = appearance;
  }
}

// tslint:disable:variable-name
/**
 * Material Design icon button component for anchor elements. This button displays a single
 * interaction icon that allows users to navigate across different routes or pages.
 * See https://material.io/develop/web/components/buttons/icon-buttons/
 */
export const MatIconAnchor = MatIconButton;
export type MatIconAnchor = MatIconButton;
// tslint:enable:variable-name
