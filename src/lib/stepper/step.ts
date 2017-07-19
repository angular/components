/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ContentChild} from '@angular/core';
import {CdkStep} from '@angular/cdk';
import {MdStepLabel} from './step-label';
import {MdStepper} from './stepper';

@Component({
  moduleId: module.id,
  selector: 'md-step, mat-step',
  templateUrl: 'step.html',
})
export class MdStep extends CdkStep {
  /** Content for the step label given by <ng-template mat-step-label>. */
  @ContentChild(MdStepLabel) stepLabel: MdStepLabel;

  constructor(mdStepper: MdStepper) {
    super(mdStepper);
  }
}
