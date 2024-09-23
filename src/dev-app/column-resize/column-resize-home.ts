/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  DefaultEnabledColumnResizeExample,
  DefaultEnabledColumnResizeFlexExample,
  OptInColumnResizeExample,
} from '@angular/components-examples/material-experimental/column-resize';
import {ChangeDetectionStrategy, Component} from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnResizeHome {}
