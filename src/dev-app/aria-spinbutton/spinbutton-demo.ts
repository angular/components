/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {
  SpinbuttonApgQuantityExample,
  SpinbuttonBasicExample,
  SpinbuttonConfigurableExample,
  SpinbuttonDisabledExample,
  SpinbuttonReadonlyExample,
  SpinbuttonTimeFieldExample,
  SpinbuttonWrapExample,
} from '@angular/components-examples/aria/spinbutton';

@Component({
  selector: 'spinbutton-demo',
  templateUrl: 'spinbutton-demo.html',
  styleUrl: 'spinbutton-demo.css',
  imports: [
    SpinbuttonApgQuantityExample,
    SpinbuttonTimeFieldExample,
    SpinbuttonBasicExample,
    SpinbuttonDisabledExample,
    SpinbuttonReadonlyExample,
    SpinbuttonWrapExample,
    SpinbuttonConfigurableExample,
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinbuttonDemo {}
