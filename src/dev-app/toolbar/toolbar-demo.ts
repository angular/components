/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ToolbarOverviewExample,
  ToolbarSimpleExample,
} from '@angular/components-examples/material/toolbar';
import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';

@Component({
  selector: 'toolbar-demo',
  templateUrl: 'toolbar-demo.html',
  styleUrl: 'toolbar-demo.css',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    ToolbarOverviewExample,
    ToolbarSimpleExample,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarDemo {}
