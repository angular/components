/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive, ElementRef, inject} from '@angular/core';

@Directive({
  selector: '[ngGrid]',
  host: {
    'role': 'grid',
  },
})
export class Grid {
  private _elementRef = inject(ElementRef);

  constructor() {}
}
