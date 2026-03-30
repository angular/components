/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgModule} from '@angular/core';
import {MatChart} from './chart';
import {MatChartValuePipe} from './chart-value.pipe';

@NgModule({
  imports: [MatChart, MatChartValuePipe],
  exports: [MatChart, MatChartValuePipe],
})
export class MatChartsModule {}
