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
      trigger('stepExpandCollapse', [
        state('collapsed', style({height: '0px', visibility: 'hidden'})),
        state('expanded', style({height: '*', visibility: 'visible'})),
        transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4,0.0,0.2,1)')),
        //   state('center', style({height: '*', visibility:'visible'})),
        //   state('left', style({height: 0, visibility:'hidden'})),
        // state('right', style({height: 0, visibility:'hidden'})),
        // transition('left => center, right => center',
        //   animate('500ms cubic-bezier(0.35, 0, 0.25, 1)')),
        //   transition('* => left, * => right', animate('500ms cubic-bezier(0.35, 0, 0.25, 1)'))
          // transition('* => left, * => right, left => center, right => center', animate('5s cubic-bezier(0.35, 0, 0.25, 1)'))
      ])
  ],
  providers: [{provide: MdStepper, useExisting: MdVerticalStepper}]
})
export class MdVerticalStepper extends MdStepper { }
