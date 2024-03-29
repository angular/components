/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {
  ToolbarBasicExample,
  ToolbarMultirowExample,
  ToolbarOverviewExample,
  ToolbarHarnessExample,
} from '@angular/components-examples/material/toolbar';
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
    ToolbarHarnessExample,
  ],
})
export class ToolbarDemo {}
