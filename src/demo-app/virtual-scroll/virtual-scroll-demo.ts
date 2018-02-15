/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ViewEncapsulation} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'virtual-scroll-demo',
  templateUrl: 'virtual-scroll-demo.html',
  styleUrls: ['virtual-scroll-demo.css'],
  encapsulation: ViewEncapsulation.None,
})
export class VirtualScrollDemo {
  data = Array(10000).fill(20);
}
