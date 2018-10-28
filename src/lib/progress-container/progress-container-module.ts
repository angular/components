/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatCommonModule} from '@angular/material/core';
import {MatProgressContainer} from './progress-container';
import {MatProgress} from './progress-directive';
import {MatProgressContent} from './progress-content';


@NgModule({
  imports: [CommonModule, MatCommonModule],
  exports: [MatProgressContainer, MatProgress, MatProgressContent, MatCommonModule],
  declarations: [MatProgressContainer, MatProgress, MatProgressContent],
})
export class MatProgressContainerModule {}
