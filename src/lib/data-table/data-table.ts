/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ViewEncapsulation} from '@angular/core';
import {CdkTable} from '../core/data-table/data-table';

/**
 * Material design styled CdkTable.
 */
@Component({
  moduleId: module.id,
  selector: 'md-table, mat-table',
  template: `
    <ng-container headerRowPlaceholder></ng-container>
    <ng-container rowPlaceholder></ng-container>
  `,
  styleUrls: ['data-table.css'],
  host: {
    'class': 'mat-table',
  },
  encapsulation: ViewEncapsulation.None,
})
export class MdTable<T> extends CdkTable<T> { }
