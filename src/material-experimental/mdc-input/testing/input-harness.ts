/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MatInputHarness as BaseInputHarness} from '@angular/material/input/testing';

/** Harness for interacting with a MDC-based Material inputs in tests. */
export class MatInputHarness extends BaseInputHarness {
  static hostSelector = '.mat-mdc-input-element';
}
