/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef, OnDestroy} from '@angular/core';
import {MDCLineRipple} from '@material/line-ripple';

@Directive({
  selector: 'div[matFormFieldLineRipple]',
  host: {
    'class': 'mdc-line-ripple',
  },
})
export class MatFormFieldLineRipple extends MDCLineRipple implements OnDestroy {
  constructor(elementRef: ElementRef) {
    super(elementRef.nativeElement);
  }

  ngOnDestroy() {
    this.destroy();
  }
}
