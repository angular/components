/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {MdStepper} from './stepper';
import {animate, state, style, transition, trigger} from '@angular/animations';

@Component({
  moduleId: module.id,
  selector: 'md-vertical-stepper, mat-vertical-stepper',
  templateUrl: 'stepper-vertical.html',
  styleUrls: ['stepper.css'],
  inputs: ['selectedIndex'],
  host: {
    'class': 'mat-stepper-vertical',
    'role': 'tablist',
  },
  animations: [
      trigger('stepTransition', [
        state('previous', style({height: '0px', visibility: 'hidden'})),
        state('next', style({height: '0px', visibility: 'hidden'})),
        state('current', style({height: '*', visibility: 'visible'})),
        transition('* <=> current', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
      ])
  ],
  providers: [{provide: MdStepper, useExisting: MdVerticalStepper}]
})
export class MdVerticalStepper extends MdStepper { }
