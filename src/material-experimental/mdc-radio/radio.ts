/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, Component, ViewEncapsulation, Input} from '@angular/core';

// Increasing integer for generating unique ids for radio components.
let nextUniqueId = 0;

/**
 * A Material design radio-button. Typically placed inside of `<mat-radio-group>` elements.
 */
@Component({
  moduleId: module.id,
  selector: 'mat-radio-button',
  templateUrl: 'radio.html',
  styleUrls: ['radio.css'],
  host: {
    'class': 'mat-mdc-radio',
  },
  exportAs: 'matRadio',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatRadio {
  // TODO: set up MDC foundation class.

  private _uniqueId: string = `mat-radio-${++nextUniqueId}`;

  /** The unique ID for the radio button. */
  @Input() id: string = this._uniqueId;

  /** ID of the native input element inside `<mat-radio-button>` */
  get inputId(): string { return `${this.id || this._uniqueId}-input`; }
}
