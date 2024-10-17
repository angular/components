/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, Input, ViewEncapsulation} from '@angular/core';

/**
 * Internal shared component used as a container in form field controls.
 * Not to be confused with `mat-form-field` which MDC calls a "text field".
 * @docs-private
 */
@Component({
  // Use a `div` selector to match the old markup closer.
  selector: 'div[mat-internal-form-field]',
  template: '<ng-content></ng-content>',
  styleUrl: 'internal-form-field.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'mdc-form-field mat-internal-form-field',
    '[class.mdc-form-field--align-end]': 'labelPosition === "before"',
  },
})
export class _MatInternalFormField {
  /** Position of the label relative to the content. */
  @Input({required: true}) labelPosition: 'before' | 'after';
}
