/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {MAT_BUTTON_HOST, MatButtonBase} from './button-base';

/**
 * Material Design button component. Users interact with a button to perform an action.
 * See https://material.io/components/buttons
 *
 * The `MatButton` class applies to native button elements and captures the appearances for
 * "text button", "outlined button", and "contained button" per the Material Design
 * specification. `MatButton` additionally captures an additional "flat" appearance, which matches
 * "contained" but without elevation.
 */
@Component({
  selector: `
    button[mat-button], button[mat-raised-button], button[mat-flat-button],
    button[mat-stroked-button], a[mat-button], a[mat-raised-button], a[mat-flat-button],
    a[mat-stroked-button]
  `,
  templateUrl: 'button.html',
  styleUrls: ['button.css', 'button-high-contrast.css'],
  host: MAT_BUTTON_HOST,
  exportAs: 'matButton, matAnchor',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatButton extends MatButtonBase {}

// tslint:disable:variable-name
/**
 * Material Design button component for anchor elements. Anchor elements are used to provide
 * links for the user to navigate across different routes or pages.
 * See https://material.io/components/buttons
 *
 * The `MatAnchor` class applies to native anchor elements and captures the appearances for
 * "text button", "outlined button", and "contained button" per the Material Design
 * specification. `MatAnchor` additionally captures an additional "flat" appearance, which matches
 * "contained" but without elevation.
 */
export const MatAnchor = MatButton;
export type MatAnchor = MatButton;
// tslint:enable:variable-name
