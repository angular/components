/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ToolbarBasicExample,
  ToolbarHarnessExample,
  ToolbarMultirowExample,
  ToolbarOverviewExample,
} from '@angular/components-examples/material/toolbar';
import {ToolbarSimpleExample} from '@angular/components-examples/material/toolbar/toolbar-simple/toolbar-simple-example';
import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';

@Component({
  selector: 'toolbar-demo',
  templateUrl: 'toolbar-demo.html',
  styleUrl: 'toolbar-demo.css',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    ToolbarBasicExample,
    ToolbarMultirowExample,
    ToolbarOverviewExample,
    ToolbarSimpleExample,
    ToolbarHarnessExample,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarDemo {}
