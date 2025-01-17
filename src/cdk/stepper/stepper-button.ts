/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive, Input, inject} from '@angular/core';

import {CdkStepper} from './stepper';

/** Button that moves to the next step in a stepper workflow. */
@Directive({
  selector: 'button[cdkStepperNext]',
  host: {
    '[type]': 'type',
    '(click)': '_stepper.next()',
  },
})
export class CdkStepperNext {
  _stepper = inject(CdkStepper);

  /** Type of the next button. Defaults to "submit" if not specified. */
  @Input() type: string = 'submit';

  constructor(...args: unknown[]);
  constructor() {}
}

/** Button that moves to the previous step in a stepper workflow. */
@Directive({
  selector: 'button[cdkStepperPrevious]',
  host: {
    '[type]': 'type',
    '(click)': '_stepper.previous()',
  },
})
export class CdkStepperPrevious {
  _stepper = inject(CdkStepper);

  /** Type of the previous button. Defaults to "button" if not specified. */
  @Input() type: string = 'button';

  constructor(...args: unknown[]);
  constructor() {}
}
