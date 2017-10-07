/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {A11yModule} from '@uiux/cdk/a11y';
import {PortalModule} from '@uiux/cdk/portal';
import {CdkStepperModule} from '@uiux/cdk/stepper';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@uiux/material/button';
import {MatCommonModule, MatRippleModule, ErrorStateMatcher} from '@uiux/material/core';
import {MatIconModule} from '@uiux/material/icon';
import {MatStepHeader} from './step-header';
import {MatStepLabel} from './step-label';
import {MatHorizontalStepper, MatStep, MatStepper, MatVerticalStepper} from './stepper';
import {MatStepperNext, MatStepperPrevious} from './stepper-button';
import {MatStepperIntl} from './stepper-intl';


@NgModule({
  imports: [
    MatCommonModule,
    CommonModule,
    PortalModule,
    MatButtonModule,
    CdkStepperModule,
    MatIconModule,
    A11yModule,
    MatRippleModule,
  ],
  exports: [
    MatCommonModule,
    MatHorizontalStepper,
    MatVerticalStepper,
    MatStep,
    MatStepLabel,
    MatStepper,
    MatStepperNext,
    MatStepperPrevious,
    MatStepHeader
  ],
  declarations: [MatHorizontalStepper, MatVerticalStepper, MatStep, MatStepLabel, MatStepper,
    MatStepperNext, MatStepperPrevious, MatStepHeader],
  providers: [MatStepperIntl, ErrorStateMatcher],
})
export class MatStepperModule {}
