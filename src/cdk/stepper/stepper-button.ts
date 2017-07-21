/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive} from '@angular/core';
import {CdkStepper} from './stepper';

@Directive({
  selector: 'button[cdkStepperNext]',
  host: {
    '(click)': '_onClick()',
  }
})
export class CdkStepperNext {
  constructor(private _stepper: CdkStepper) { }

  _onClick(): void {
    this._stepper.next();
  }
}

@Directive({
  selector: 'button[cdkStepperPrevious]',
  host: {
    '(click)': '_onClick()',
  }
})
export class CdkStepperPrevious {
  constructor(private _stepper: CdkStepper) { }

  _onClick(): void {
    this._stepper.previous();
  }
}
