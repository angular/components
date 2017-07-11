/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CdkStepper} from './stepper';
import {Component, ContentChildren, QueryList} from '@angular/core';
import {MdStep} from "./step";
@Component({
    moduleId: module.id,
    selector: 'mat-vertical-stepper',
    templateUrl: 'stepper-vertical.html',
    styleUrls: ['stepper.scss'],
    inputs: ['selectedIndex'],
})
export class MdVerticalStepper extends CdkStepper {
    @ContentChildren(MdStep) _steps: QueryList<MdStep>;
}