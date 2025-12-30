/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Directive,
  ElementRef,
  inject,
  Optional,
  SkipSelf,
  Injector,
  AfterViewInit,
} from '@angular/core';
import {GRID_ROW} from './tokens';

@Directive({
  selector: '[ngGridCell]',
  host: {
    'role': 'gridcell',
  },
})
export class GridCell implements AfterViewInit {
  private _elementRef = inject(ElementRef);
  private _injector = inject(Injector);
  private _gridRow: any;

  constructor() {
    // Try to inject GRID_ROW, but don't fail if not found
    try {
      this._gridRow = this._injector.get(GRID_ROW, null, {optional: true, skipSelf: true});
    } catch {
      this._gridRow = null;
    }
  }

  ngAfterViewInit(): void {
    if (!this._gridRow) {
      // Fallback: Look for grid row in DOM hierarchy when DI fails (e.g., in CDK table)
      this._findGridRowInDom();
    }
  }

  private _findGridRowInDom(): void {
    let element = this._elementRef.nativeElement.parentElement;
    while (element) {
      if (element.hasAttribute('ngGridRow') || element.getAttribute('role') === 'row') {
        // Found a grid row element, create a mock grid row reference
        this._gridRow = {element};
        break;
      }
      element = element.parentElement;
    }

    if (!this._gridRow) {
      console.warn(
        'GridCell: No grid row found in DOM hierarchy. This may indicate a setup issue.',
      );
    }
  }
}
