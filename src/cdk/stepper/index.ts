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

@NgModule({
  imports: [CommonModule],
  exports: [CdkStep, CdkStepper, CdkStepLabel],
  declarations: [CdkStep, CdkStepper, CdkStepLabel]
})
export class CdkStepperModule {}

export * from './stepper';
export * from './step-label';
