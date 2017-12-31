/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  animate,
  state,
  style,
  transition,
  trigger,
  AnimationTriggerMetadata,
} from '@angular/animations';

/**
 * Animations used by the Material stepper.
 * @docs-private
 */
export const matStepperAnimations: AnimationTriggerMetadata[] = [
  trigger('horizontalStepTransition', [
    state('previous', style({transform: 'translate3d(-100%, 0, 0)', visibility: 'hidden'})),
    state('current', style({transform: 'none', visibility: 'visible'})),
    state('next', style({transform: 'translate3d(100%, 0, 0)', visibility: 'hidden'})),
    transition('* => *', animate('500ms cubic-bezier(0.35, 0, 0.25, 1)'))
  ]),
  trigger('verticalStepTransition', [
    state('previous', style({height: '0px', visibility: 'hidden'})),
    state('next', style({height: '0px', visibility: 'hidden'})),
    state('current', style({height: '*', visibility: 'visible'})),
    transition('* <=> current', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
  ])
];
