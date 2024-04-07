/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {A11yModule, FocusMonitor} from '@angular/cdk/a11y';
import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'focus-origin-demo',
  templateUrl: 'focus-origin-demo.html',
  styleUrl: 'focus-origin-demo.css',
  standalone: true,
  imports: [A11yModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FocusOriginDemo {
  constructor(public fom: FocusMonitor) {}
}
