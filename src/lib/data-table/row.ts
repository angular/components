/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {CdkHeaderRow, CdkRow} from '../core/data-table/row';

/** Header template container that contains the cell outlet. Adds the right class and role. */
@Component({
  selector: 'md-header-row, mat-header-row',
  template: '<ng-container cdkCellOutlet></ng-container>',
  host: {
    'class': 'mat-header-row',
  },
})
export class MdHeaderRow extends CdkHeaderRow { }

/** Data row template container that contains the cell outlet. Adds the right class and role. */
@Component({
  selector: 'md-row, mat-row',
  template: '<ng-container cdkCellOutlet></ng-container>',
  host: {
    'class': 'mat-row',
  },
})
export class MdRow extends CdkRow { }
