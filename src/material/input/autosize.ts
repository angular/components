/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {Directive, Input} from '@angular/core';
import {
  BooleanInput,
  NumberInput,
  coerceBooleanProperty,
  coerceNumberProperty,
} from '@angular/cdk/coercion';

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
    'class': 'cdk-textarea-autosize mat-autosize',
    // Textarea elements that have the directive applied should have a single row by default.
    // Browsers normally show two rows by default and therefore this limits the minRows binding.
    'rows': '1',
  },
})
export class MatTextareaAutosize extends CdkTextareaAutosize {
  @Input()
  get matAutosizeMinRows(): number { return this.minRows; }
  set matAutosizeMinRows(value: number) { this.minRows = coerceNumberProperty(value); }

  @Input()
  get matAutosizeMaxRows(): number { return this.maxRows; }
  set matAutosizeMaxRows(value: number) { this.maxRows = coerceNumberProperty(value); }

  @Input('mat-autosize')
  get matAutosize(): boolean { return this.enabled; }
  set matAutosize(value: boolean) { this.enabled = coerceBooleanProperty(value); }

  @Input()
  get matTextareaAutosize(): boolean { return this.enabled; }
  set matTextareaAutosize(value: boolean) { this.enabled = coerceBooleanProperty(value); }

  static ngAcceptInputType_matAutosizeMinRows: NumberInput;
  static ngAcceptInputType_matAutosizeMaxRows: NumberInput;
  static ngAcceptInputType_matAutosize: BooleanInput;
  static ngAcceptInputType_matTextareaAutosize: BooleanInput;
}
