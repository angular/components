/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ContentChildren, QueryList} from '@angular/core';
import {MdStep} from './step';
import {CdkStepper} from '@angular/cdk';

@Component({
  moduleId: module.id,
  selector: 'md-vertical-stepper, mat-vertical-stepper',
  templateUrl: 'stepper-vertical.html',
  styleUrls: ['stepper.scss'],
  inputs: ['selectedIndex'],
})
export class MdVerticalStepper extends CdkStepper {
  @ContentChildren(MdStep) _steps: QueryList<MdStep>;
}
