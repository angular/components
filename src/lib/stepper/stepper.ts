/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CdkStep, CdkStepper} from '@angular/cdk';
import {
  Component,
  ContentChild,
  ContentChildren,
  // This import is only used to define a generic type. The current TypeScript version incorrectly
  // considers such imports as unused (https://github.com/Microsoft/TypeScript/issues/14953)
  // tslint:disable-next-line:no-unused-variable
  ElementRef,
  QueryList,
  ViewChildren
}from '@angular/core';
import {MdStepLabel} from './step-label';

@Component({
  moduleId: module.id,
  selector: 'md-step, mat-step',
  templateUrl: 'step.html',
})
export class MdStep extends CdkStep {
  /** Content for step label given by <ng-template matStepLabel> or <ng-template mdStepLabel>. */
  @ContentChild(MdStepLabel) stepLabel: MdStepLabel;

  constructor(mdStepper: MdStepper) {
    super(mdStepper);
  }
}

export class MdStepper extends CdkStepper {
  /** The list of step headers of the steps in the stepper. */
  @ViewChildren('stepHeader') _stepHeader: QueryList<ElementRef>;

  /** Steps that the stepper holds. */
  @ContentChildren(MdStep) _steps: QueryList<MdStep>;
}
