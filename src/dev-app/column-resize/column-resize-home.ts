/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {
  DefaultEnabledColumnResizeExample,
  DefaultEnabledColumnResizeFlexExample,
  OptInColumnResizeExample,
} from '@angular/components-examples/material-experimental/column-resize';
import {MatExpansionModule} from '@angular/material/expansion';

@Component({
  templateUrl: 'column-resize-home.html',
  standalone: true,
  imports: [
    MatExpansionModule,
    DefaultEnabledColumnResizeExample,
    DefaultEnabledColumnResizeFlexExample,
    OptInColumnResizeExample,
  ],
})
export class ColumnResizeHome {}
