/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CdkStep, MdStep} from './step';
import {CdkStepper} from './stepper';
import {MdCommonModule} from '../core';
import {CommonModule} from '@angular/common';
import {PortalModule} from "@angular/cdk";
import {MdButtonModule} from "../button/index";
import {MdHorizontalStepper} from "./stepper-horizontal";
import {MdVerticalStepper} from "./stepper-vertical";
@NgModule({
    imports: [MdCommonModule, CommonModule, PortalModule, MdButtonModule],
    exports: [CdkStep, MdCommonModule, MdHorizontalStepper, MdVerticalStepper, MdStep],
    declarations: [CdkStep, CdkStepper, MdHorizontalStepper, MdVerticalStepper, MdStep]
})
export class CdkStepperModule {}

export * from './stepper';
