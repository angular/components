/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Input} from '@angular/core';
import {CdkStep} from './stepper';

@Directive({
  selector: 'cdkStepIcon'
})
export class CdkStepIcon {
  /** Step of the icon to be displayed. */
  @Input()
  step: CdkStep;

  /** Whether the step of the icon to be displayed is active. */
  @Input()
  selected: boolean;

  /** Index of the step. */
  @Input()
  index: number;

  /** Whether the user has touched the step that is not selected. */
  get notTouched() {
    return this._getIndicatorType() == 'number' && !this.selected;
  }

  /** Returns the type of icon to be displayed. */
  _getIndicatorType(): 'number' | 'edit' | 'done' {
    if (!this.step.completed || this.selected) {
      return 'number';
    } else {
      return this.step.editable ? 'edit' : 'done';
    }
  }
}
