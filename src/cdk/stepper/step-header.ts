/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive, ElementRef, inject} from '@angular/core';
import {FocusableOption} from '@angular/cdk/a11y';

@Directive({
  selector: '[cdkStepHeader]',
  host: {
    'role': 'tab',
  },
})
export class CdkStepHeader implements FocusableOption {
  _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor(...args: unknown[]);
  constructor() {}

  /** Focuses the step header. */
  focus() {
    this._elementRef.nativeElement.focus();
  }
}
