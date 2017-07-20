/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ContentChildren, QueryList} from '@angular/core';
import {MdStep} from './step';
import {MdStepper} from './stepper';

@Component({
  moduleId: module.id,
  selector: 'md-vertical-stepper, mat-vertical-stepper',
  templateUrl: 'stepper-vertical.html',
  styleUrls: ['stepper.scss'],
  inputs: ['selectedIndex'],
  host: {
    'class': 'mat-stepper-vertical',
    'role': 'tablist',
  },
  providers: [{ provide: MdStepper, useExisting: MdVerticalStepper }]
})
export class MdVerticalStepper extends MdStepper {
  /** Steps that the vertical stepper holds. */
  @ContentChildren(MdStep) _steps: QueryList<MdStep>;
}
