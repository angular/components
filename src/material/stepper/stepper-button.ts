/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CdkStepperNext, CdkStepperPrevious} from '@angular/cdk/stepper';
import {Directive} from '@angular/core';

/** Button that moves to the next step in a stepper workflow. */
@Directive({
  selector: 'button[matStepperNext]',
  host: {
    'class': 'mat-stepper-next',
    '[type]': 'type',
  },
})
export class MatStepperNext extends CdkStepperNext {}

/** Button that moves to the previous step in a stepper workflow. */
@Directive({
  selector: 'button[matStepperPrevious]',
  host: {
    'class': 'mat-stepper-previous',
    '[type]': 'type',
  },
})
export class MatStepperPrevious extends CdkStepperPrevious {}
