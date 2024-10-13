/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  afterNextRender,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Injector,
  ViewChild,
} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {MatButtonModule} from '@angular/material/button';
import {MatDividerModule} from '@angular/material/divider';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatSelectModule} from '@angular/material/select';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';

@Component({
  selector: 'performance-demo',
  templateUrl: 'performance-demo.html',
  styleUrl: 'performance-demo.css',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatSelectModule,
    MatTableModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PerformanceDemo implements AfterViewInit {
  /** Controls the rendering of components. */
  show = false;

  /** The number of times metrics will be gathered. */
  sampleSize = 100;

  /** The number of components being rendered. */
  componentCount = 100;

  /** A flat array of every sample recorded. */
  allSamples: number[] = [];

  /** Used to disable benchmark controls while a benchmark is being run. */
  isRunningBenchmark = false;

  /** The columns in the metrics table. */
  displayedColumns: string[] = ['index', 'time'];

  /** Basically the same thing as allSamples but organized as a mat-table data source. */
  dataSource = new MatTableDataSource<{index: number; time: string}>();

  /** The average plus/minus the stdev. */
  computedResults = '';

  /** Used in an `@for` to render the desired number of comonents. */
  componentArray = [].constructor(this.componentCount);

  private _injector = inject(Injector);

  readonly cdr = inject(ChangeDetectorRef);

  /** The standard deviation of the recorded samples. */
  get stdev(): number | undefined {
    if (!this.allSamples.length) {
      return undefined;
    }
    return Math.sqrt(
      this.allSamples.map(x => Math.pow(x - this.mean!, 2)).reduce((a, b) => a + b) /
        this.allSamples.length,
    );
  }

  /** The average value of the recorded samples. */
  get mean(): number | undefined {
    if (!this.allSamples.length) {
      return undefined;
    }
    return this.allSamples.reduce((a, b) => a + b) / this.allSamples.length;
  }

  @ViewChild(MatPaginator) paginator?: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator!;
  }

  getTotalRenderTime(): string {
    return this.allSamples.length ? `${this.format(this.mean!)} ± ${this.format(this.stdev!)}` : '';
  }

  format(num: number): string {
    const roundedNum = Math.round(num * 100) / 100;
    return roundedNum >= 10 ? roundedNum.toFixed(2) : '0' + roundedNum.toFixed(2);
  }

  async runBenchmark(): Promise<void> {
    this.isRunningBenchmark = true;
    const samples = [];
    for (let i = 0; i < this.sampleSize; i++) {
      samples.push(await this.recordSample());
    }
    this.dataSource.data = this.dataSource.data.concat(
      samples.map((sample, i) => ({
        index: this.allSamples.length + i,
        time: this.format(sample),
      })),
    );
    this.allSamples.push(...samples);
    this.isRunningBenchmark = false;
    this.computedResults = this.getTotalRenderTime();
    this.cdr.markForCheck();
  }

  clearMetrics() {
    this.allSamples = [];
    this.dataSource.data = [];
    this.computedResults = this.getTotalRenderTime();
  }

  recordSample(): Promise<number> {
    return new Promise(res => {
      setTimeout(() => {
        this.show = true;
        this.cdr.markForCheck();
        const start = performance.now();
        afterNextRender(
          () => {
            const end = performance.now();
            this.show = false;
            this.cdr.markForCheck();
            res(end - start);
          },
          {injector: this._injector},
        );
      });
    });
  }
}
