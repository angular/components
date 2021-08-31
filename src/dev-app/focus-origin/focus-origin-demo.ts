/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FocusMonitor} from '@angular/cdk/a11y';
import {Component} from '@angular/core';


@Component({
  selector: 'focus-origin-demo',
  templateUrl: 'focus-origin-demo.html',
  styleUrls: ['focus-origin-demo.css'],
})
export class FocusOriginDemo {
  constructor(public fom: FocusMonitor) {}
}
