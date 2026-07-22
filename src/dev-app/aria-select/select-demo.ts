/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {
  SelectDisabledExample,
  SelectMultiExample,
  SelectExample,
} from '@angular/components-examples/aria/select';

@Component({
  templateUrl: 'select-demo.html',
  styleUrl: 'select-demo.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SelectDisabledExample, SelectMultiExample, SelectExample],
})
export class SelectDemo {}
