/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive, ElementRef, inject, forwardRef} from '@angular/core';
import {GRID_ROW} from './tokens';

@Directive({
  selector: '[ngGridRow]',
  providers: [{provide: GRID_ROW, useExisting: forwardRef(() => GridRow)}],
  host: {
    'role': 'row',
  },
})
export class GridRow {
  private _elementRef = inject(ElementRef);

  constructor() {}
}
