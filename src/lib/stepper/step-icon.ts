/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {CdkStepIcon} from '@angular/cdk/stepper';

@Component({
  selector: 'md-step-icon, mat-step-icon',
  templateUrl: 'step-icon.html',
  host: {
    'class': 'mat-step-icon',
    '[class.mat-step-icon-not-touched]': 'notTouched'
  }
})
export class MdStepIcon extends CdkStepIcon { }
