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
  selector: 'cdkStepLabelContainer'
})
export class CdkStepLabelContainer {
  /** Step of the label to be displayed. */
  @Input()
  step: CdkStep;

  /** Whether the step of label to be displayed is selected. */
  @Input()
  selected: boolean;

  /** Whether the label to be displayed is active. */
  get active() {
    return this.step.completed || this.selected;
  }
}
