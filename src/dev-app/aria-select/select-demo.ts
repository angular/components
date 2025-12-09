/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {SelectMultiExample, SelectExample} from '@angular/components-examples/aria/select';

@Component({
  templateUrl: 'select-demo.html',
  styleUrl: 'select-demo.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SelectMultiExample, SelectExample],
})
export class SelectDemo {}
