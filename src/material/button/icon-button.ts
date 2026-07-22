/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {MatButtonBase} from './button-base';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatIconButton extends MatButtonBase {
  constructor(...args: unknown[]);

  constructor() {
    super();
    this._rippleLoader.configureRipple(this._elementRef.nativeElement, {centered: true});
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
