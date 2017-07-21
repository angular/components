/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {MdStepper} from './stepper';

@Component({
  moduleId: module.id,
  selector: 'md-horizontal-stepper, mat-horizontal-stepper',
  templateUrl: 'stepper-horizontal.html',
  styleUrls: ['stepper.scss'],
  inputs: ['selectedIndex'],
  host: {
    'class': 'mat-stepper-horizontal',
    'role': 'tablist',
  },
  providers: [{provide: MdStepper, useExisting: MdHorizontalStepper}]
})
export class MdHorizontalStepper extends MdStepper { }
