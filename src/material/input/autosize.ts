/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {Directive, Input} from '@angular/core';

/**
 * Directive to automatically resize a textarea to fit its content.
 * @deprecated Use `cdkTextareaAutosize` from `@angular/cdk/text-field` instead.
 * @breaking-change 8.0.0
 */
@Directive({
  selector: 'textarea[mat-autosize], textarea[matTextareaAutosize]',
  exportAs: 'matTextareaAutosize',
  inputs: ['cdkAutosizeMinRows', 'cdkAutosizeMaxRows'],
  host: {
    'class': 'mat-autosize',

    // Remove the class when disabled, because it removes the native browser resizing.
    '[class.cdk-textarea-autosize]': 'enabled',
    // Textarea elements that have the directive applied should have a single row by default.
    // Browsers normally show two rows by default and therefore this limits the minRows binding.
    '[attr.rows]': 'enabled ? 1 : null',
  },
})
export class MatTextareaAutosize extends CdkTextareaAutosize {
  @Input()
  get matAutosizeMinRows(): number { return this.minRows; }
  set matAutosizeMinRows(value: number) { this.minRows = value; }

  @Input()
  get matAutosizeMaxRows(): number { return this.maxRows; }
  set matAutosizeMaxRows(value: number) { this.maxRows = value; }

  @Input('mat-autosize')
  get matAutosize(): boolean { return this.enabled; }
  set matAutosize(value: boolean) { this.enabled = value; }

  @Input()
  get matTextareaAutosize(): boolean { return this.enabled; }
  set matTextareaAutosize(value: boolean) { this.enabled = value; }
}
