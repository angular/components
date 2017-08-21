/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {CdkStepHeader} from '@angular/cdk/stepper';
import {MdStepper} from './stepper';

@Component({
  selector: 'md-step-header, mat-step-header',
  templateUrl: 'step-header.html',
  styleUrls: ['step-header.css'],
  host: {
    'class': 'mat-step-header',
    'role': 'tab',
    '[attr.id]': 'labelId',
    '[attr.aria-controls]': 'contentId',
    '[attr.aria-selected]': 'selected'
  }
})
export class MdStepHeader extends CdkStepHeader {
  constructor(mdStepper: MdStepper) {
    super(mdStepper);
  }
}
