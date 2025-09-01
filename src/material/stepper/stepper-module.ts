/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {PortalModule} from '@angular/cdk/portal';
import {CdkStepperModule} from '@angular/cdk/stepper';
import {NgModule} from '@angular/core';
import {ErrorStateMatcher, MatCommonModule, MatRippleModule} from '../core';
import {MatIconModule} from '../icon';
import {MatStepHeader} from './step-header';
import {MatStepLabel} from './step-label';
import {MatStep, MatStepper} from './stepper';
import {MatStepperNext, MatStepperPrevious} from './stepper-button';
import {MatStepperIcon} from './stepper-icon';
import {MatStepContent} from './step-content';

@NgModule({
  imports: [
    MatCommonModule,
    PortalModule,
    CdkStepperModule,
    MatIconModule,
    MatRippleModule,
    MatStep,
    MatStepLabel,
    MatStepper,
    MatStepperNext,
    MatStepperPrevious,
    MatStepHeader,
    MatStepperIcon,
    MatStepContent,
  ],
  exports: [
    MatCommonModule,
    MatStep,
    MatStepLabel,
    MatStepper,
    MatStepperNext,
    MatStepperPrevious,
    MatStepHeader,
    MatStepperIcon,
    MatStepContent,
  ],
  providers: [ErrorStateMatcher],
})
export class MatStepperModule {}
