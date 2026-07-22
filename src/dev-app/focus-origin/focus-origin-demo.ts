/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {A11yModule, FocusMonitor} from '@angular/cdk/a11y';

@Component({
  selector: 'focus-origin-demo',
  templateUrl: 'focus-origin-demo.html',
  styleUrl: 'focus-origin-demo.css',
  imports: [A11yModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FocusOriginDemo {
  fom = inject(FocusMonitor);
}
