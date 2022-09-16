/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {MatDatepickerCloseButton as BaseDatepickerCloseButton} from '@angular/material/datepicker';

/** @docs-private */
@Component({
  selector: 'mat-datepicker-close-button',
  templateUrl: './datepicker-close-button.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatLegacyDatepickerCloseButton extends BaseDatepickerCloseButton {}
