/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MdStep} from './step';
import {MdStepper} from './stepper';
import {MdCommonModule} from '../core';
import {CommonModule} from '@angular/common';
import {PortalModule} from "@angular/cdk";
import {MdButtonModule} from "../button/index";
@NgModule({
    imports: [MdCommonModule, CommonModule, PortalModule, MdButtonModule],
    exports: [MdStep, MdStepper, MdCommonModule],
    declarations: [MdStep, MdStepper]
})
export class MdStepperModule {}

export * from './stepper';
