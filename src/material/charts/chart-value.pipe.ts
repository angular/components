/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Pipe, PipeTransform} from '@angular/core';
import {MatChartDataPoint} from './chart-types';

/**
 * Looks up the numeric value for a given label inside a dataset's data array.
 * Used in the chart template to avoid calling methods inside `@for` loops.
 *
 * @example
 * {{ dataset.data | chartValue: 'Jan' }}  // → 42
 */
@Pipe({name: 'chartValue'})
export class MatChartValuePipe implements PipeTransform {
  transform(data: MatChartDataPoint[], label: string): number {
    return data.find(pt => pt.label === label)?.value ?? 0;
  }
}
