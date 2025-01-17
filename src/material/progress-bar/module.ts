/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgModule} from '@angular/core';
import {MatCommonModule} from '@angular/material/core';
import {MatProgressBar} from './progress-bar';

@NgModule({
  imports: [MatProgressBar],
  exports: [MatProgressBar, MatCommonModule],
})
export class MatProgressBarModule {}
