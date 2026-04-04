/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/** Supported chart types. */
export type MatChartType = 'line' | 'bar' | 'pie';

/** A single data point in a chart dataset. */
export interface MatChartDataPoint {
  label: string;
  value: number;
}

/** A dataset to be rendered in the chart. */
export interface MatChartDataset {
  label: string;
  data: MatChartDataPoint[];
  color?: string;
}
