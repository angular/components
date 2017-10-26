/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ViewEncapsulation, ChangeDetectionStrategy, ViewChild} from '@angular/core';
import {FocusTrapDirective} from '@angular/cdk/a11y';

/**
 * Fixed header that will be rendered above a select's options.
 * Can be used as a bar for filtering out options.
 */
@Component({
  moduleId: module.id,
  selector: 'mat-select-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  templateUrl: 'select-header.html',
  host: {
    'class': 'mat-select-header',
  }
})
export class MatSelectHeader {
  @ViewChild(FocusTrapDirective) _focusTrap: FocusTrapDirective;

  _trapFocus() {
    this._focusTrap.focusTrap.focusFirstTabbableElementWhenReady();
  }
}
