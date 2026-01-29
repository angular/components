/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {
  SpinButtonGuestCounterExample,
  SpinButtonTimeFieldExample,
} from '@angular/components-examples/aria/spinbutton';

@Component({
  templateUrl: 'spinbutton-demo.html',
  imports: [SpinButtonGuestCounterExample, SpinButtonTimeFieldExample],
  styleUrl: 'spinbutton-demo.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinButtonDemo {}
