/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, ViewEncapsulation} from '@angular/core';
import {
  GridConfigurableExample,
  GridPillListExample,
  GridCalendarExample,
  GridTableExample,
} from '@angular/components-examples/aria/grid';

@Component({
  templateUrl: 'grid-demo.html',
  imports: [GridConfigurableExample, GridPillListExample, GridCalendarExample, GridTableExample],
  styleUrl: 'grid-demo.css',
  encapsulation: ViewEncapsulation.None,
})
export class GridDemo {}
