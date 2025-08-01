/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgModule} from '@angular/core';
import {MatCommonModule} from '../core';
import {MatProgressSpinner, MatSpinner} from './progress-spinner';

@NgModule({
  imports: [MatProgressSpinner, MatSpinner],
  exports: [MatProgressSpinner, MatSpinner, MatCommonModule],
})
export class MatProgressSpinnerModule {}
