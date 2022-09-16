/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, Component, inject, ViewEncapsulation} from '@angular/core';
import {MatDatepickerContent} from './datepicker-base';

/** @docs-private */
@Component({
  selector: 'mat-datepicker-close-button',
  templateUrl: './datepicker-close-button.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatDatepickerCloseButton {
  private _content = inject(MatDatepickerContent);
  _hasFocus = false;

  _handleClick() {
    this._content.datepicker.close();
  }

  _getColor() {
    return this._content.color || 'primary';
  }

  _getText() {
    return this._content._closeButtonText;
  }
}
