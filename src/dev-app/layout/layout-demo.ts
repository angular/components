/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CommonModule} from '@angular/common';
import {BreakpointObserverOverviewExample} from '@angular/components-examples/cdk/layout';
import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'layout-demo',
  templateUrl: 'layout-demo.html',
  styleUrl: 'layout-demo.css',
  standalone: true,
  imports: [CommonModule, BreakpointObserverOverviewExample],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutDemo {}
