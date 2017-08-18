/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {CdkStepLabelContainer} from '@angular/cdk/stepper';

@Component({
  selector: 'md-step-label-container, mat-step-label-container',
  templateUrl: 'step-label-container.html',
  host: {
    'class': 'mat-step-label-container',
    '[class.mat-step-label-active]': 'active',
    '[class.mat-step-label-inactive]': '!active'
  }
})
export class MdStepLabelContainer extends CdkStepLabelContainer { }
