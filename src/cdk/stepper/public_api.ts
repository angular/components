/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CdkStepper, CdkStep} from './stepper';
import {CommonModule} from '@angular/common';
import {CdkStepLabel} from './step-label';
import {CdkStepperNext, CdkStepperPrevious} from './stepper-button';
import {CdkStepIcon} from './step-icon';
import {CdkStepLabelContainer} from './step-label-container';

@NgModule({
  imports: [CommonModule],
  exports: [CdkStep, CdkStepper, CdkStepLabel, CdkStepperNext, CdkStepperPrevious, CdkStepIcon,
    CdkStepLabelContainer],
  declarations: [CdkStep, CdkStepper, CdkStepLabel, CdkStepperNext, CdkStepperPrevious, CdkStepIcon,
    CdkStepLabelContainer]
})
export class CdkStepperModule {}

export * from './stepper';
export * from './step-label';
export * from './stepper-button';
export * from './step-icon';
export * from './step-label-container';
