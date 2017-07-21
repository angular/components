/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive} from '@angular/core';
import {CdkStepperNext, CdkStepperPrevious} from '@angular/cdk';
import {MdStepper} from './stepper';

@Directive({
  selector: 'button[mdStepperNext], button[matStepperNext]',
  host: {
    '(click)': '_onClick()',
  }
})
export class MdStepperNext extends CdkStepperNext {
  constructor(mdStepper: MdStepper) {
    super(mdStepper);
  }
}

@Directive({
  selector: 'button[mdStepperPrevious], button[matStepperPrevious]',
  host: {
    '(click)': '_onClick()',
  }
})
export class MdStepperPrevious extends CdkStepperPrevious {
  constructor(mdStepper: MdStepper) {
    super(mdStepper);
  }
}
