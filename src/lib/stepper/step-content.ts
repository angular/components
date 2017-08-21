/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {CdkStepContent} from '@angular/cdk/stepper';
import {MdStepper} from './stepper';

@Component({
  selector: 'md-step-content, mat-step-content',
  templateUrl: 'step-content.html',
  styleUrls: ['step-content.css'],
  host: {
    '[class.mat-vertical-stepper-content]': '!horizontal',
    '[class.mat-horizontal-stepper-content]': 'horizontal',
    'role': 'tabpanel',
    '[attr.id]': 'contentId',
    '[attr.aria-labelledby]': 'labelId',
    '[attr.aria-expanded]': 'selectedIndex == index',
  },
})
export class MdStepContent extends CdkStepContent {
  constructor(mdStepper: MdStepper) {
    super(mdStepper);
  }
}
