/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {BidiModule} from '@angular/cdk/bidi';
import {NgModule} from '@angular/core';
import {MatProgressSpinner, MatSpinner} from './progress-spinner';

@NgModule({
  imports: [MatProgressSpinner, MatSpinner],
  exports: [MatProgressSpinner, MatSpinner, BidiModule],
})
export class MatProgressSpinnerModule {}
