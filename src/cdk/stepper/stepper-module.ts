/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgModule} from '@angular/core';
import {CdkStepper, CdkStep} from './stepper';
import {CdkStepLabel} from './step-label';
import {CdkStepperNext, CdkStepperPrevious} from './stepper-button';
import {CdkStepHeader} from './step-header';
import {BidiModule} from '../bidi';

@NgModule({
  imports: [
    BidiModule,
    CdkStep,
    CdkStepper,
    CdkStepHeader,
    CdkStepLabel,
    CdkStepperNext,
    CdkStepperPrevious,
  ],
  exports: [CdkStep, CdkStepper, CdkStepHeader, CdkStepLabel, CdkStepperNext, CdkStepperPrevious],
})
export class CdkStepperModule {}
