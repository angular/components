/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
  booleanAttribute,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {ThemePalette} from '../core';
import {MatChartDataset, MatChartType} from './chart-types';

/**
 * Material-themed chart component supporting line, bar, and pie chart types.
 * Renders via SVG for full accessibility and zero external dependencies.
 */
@Component({
  selector: 'mat-chart',
  exportAs: 'matChart',
  templateUrl: 'chart.html',
  host: {
    'class': 'mat-chart',
    '[class.mat-chart-line]': 'type === "line"',
    '[class.mat-chart-bar]': 'type === "bar"',
    '[class.mat-chart-pie]': 'type === "pie"',
    'role': 'img',
    '[attr.aria-label]': 'ariaLabel || label',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MatChart implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('svgEl', {static: true}) private _svgEl!: ElementRef<SVGSVGElement>;

  private _platformId = inject(PLATFORM_ID);
  private _elementRef = inject(ElementRef);

  /** The type of chart to render. */
  @Input() type: MatChartType = 'bar';

  /** Datasets to render. Each dataset maps to a series. */
  @Input() datasets: MatChartDataset[] = [];

  /** Accessible label for the chart. Falls back to `label`. */
  @Input('aria-label') ariaLabel: string = '';

  /** Human-readable title shown above the chart. */
  @Input() label: string = '';

  /**
   * Theme color of the chart. This API is supported in M2 themes only.
   * Has no effect in M3 themes.
   */
  @Input() color: ThemePalette = 'primary';

  /** Whether to show the tooltip on hover. */
  @Input({transform: booleanAttribute}) showTooltip: boolean = true;

  /** Whether to show the legend. */
  @Input({transform: booleanAttribute}) showLegend: boolean = true;

  /** Width of the chart in pixels. Defaults to container width. */
  @Input() width: number = 0;

  /** Height of the chart in pixels. */
  @Input() height: number = 300;

  // Internal computed state exposed to the template.
  _svgWidth = 0;
  _svgHeight = 0;
  _isBrowser: boolean;

  // Padding around the plot area.
  private readonly _padding = {top: 20, right: 20, bottom: 40, left: 50};

  constructor() {
    this._isBrowser = isPlatformBrowser(this._platformId);
  }

  ngAfterViewInit(): void {
    if (this._isBrowser) {
      this._measure();
    }
  }

  ngOnChanges(_changes: SimpleChanges): void {
    if (this._isBrowser && this._svgEl) {
      this._measure();
    }
  }

  ngOnDestroy(): void {}

  /** Re-measures the host element and triggers a re-render. */
  private _measure(): void {
    const hostWidth =
      this.width || this._elementRef.nativeElement.getBoundingClientRect().width || 400;
    this._svgWidth = hostWidth;
    this._svgHeight = this.height || 300;
  }

  // ─── Plot-area helpers ────────────────────────────────────────────────────

  get _plotWidth(): number {
    return this._svgWidth - this._padding.left - this._padding.right;
  }

  get _plotHeight(): number {
    return this._svgHeight - this._padding.top - this._padding.bottom;
  }

  get _plotTransform(): string {
    return `translate(${this._padding.left},${this._padding.top})`;
  }

  // ─── Shared data helpers ──────────────────────────────────────────────────

  /** All unique labels across every dataset (used as x-axis categories). */
  get _allLabels(): string[] {
    const seen = new Set<string>();
    for (const ds of this.datasets) {
      for (const pt of ds.data) {
        seen.add(pt.label);
      }
    }
    return Array.from(seen);
  }

  /** Maximum value across all datasets (used to scale y-axis). */
  get _maxValue(): number {
    let max = 0;
    for (const ds of this.datasets) {
      for (const pt of ds.data) {
        if (pt.value > max) max = pt.value;
      }
    }
    return max || 1;
  }

  /** Total value across all datasets (used for pie slices). */
  get _totalValue(): number {
    return (
      this.datasets.reduce((sum, ds) => sum + ds.data.reduce((s, pt) => s + pt.value, 0), 0) || 1
    );
  }

  // ─── Bar chart helpers ────────────────────────────────────────────────────

  get _barGroups(): {
    label: string;
    bars: {color: string; height: number; y: number; label: string}[];
  }[] {
    const labels = this._allLabels;
    const groupWidth = this._plotWidth / (labels.length || 1);
    return labels.map(label => ({
      label,
      bars: this.datasets.map((ds, i) => {
        const pt = ds.data.find(d => d.label === label);
        const val = pt?.value ?? 0;
        const h = (val / this._maxValue) * this._plotHeight;
        return {
          color: ds.color || this._defaultColor(i),
          height: h,
          y: this._plotHeight - h,
          label: ds.label,
        };
      }),
    }));
  }

  barGroupTransform(groupIndex: number): string {
    const labels = this._allLabels;
    const groupWidth = this._plotWidth / (labels.length || 1);
    return `translate(${groupIndex * groupWidth}, 0)`;
  }

  barX(barIndex: number): number {
    const barCount = this.datasets.length || 1;
    const groupWidth = this._plotWidth / (this._allLabels.length || 1);
    const barWidth = groupWidth / barCount;
    return barIndex * barWidth;
  }

  barWidth(): number {
    const barCount = this.datasets.length || 1;
    const groupWidth = this._plotWidth / (this._allLabels.length || 1);
    return Math.max(1, groupWidth / barCount - 2);
  }

  // ─── Line chart helpers ───────────────────────────────────────────────────

  linePath(ds: MatChartDataset): string {
    const labels = this._allLabels;
    const step = this._plotWidth / Math.max(labels.length - 1, 1);
    const points = labels.map((lbl, i) => {
      const pt = ds.data.find(d => d.label === lbl);
      const val = pt?.value ?? 0;
      const x = i * step;
      const y = this._plotHeight - (val / this._maxValue) * this._plotHeight;
      return `${x},${y}`;
    });
    return points.length ? `M${points.join('L')}` : '';
  }

  dotCx(labelIndex: number): number {
    const step = this._plotWidth / Math.max(this._allLabels.length - 1, 1);
    return labelIndex * step;
  }

  dotCy(ds: MatChartDataset, label: string): number {
    const pt = ds.data.find(d => d.label === label);
    const val = pt?.value ?? 0;
    return this._plotHeight - (val / this._maxValue) * this._plotHeight;
  }

  // ─── Pie chart helpers ────────────────────────────────────────────────────

  get _pieSlices(): {path: string; color: string; label: string; value: number}[] {
    const cx = this._svgWidth / 2;
    const cy = this._svgHeight / 2;
    const r = Math.min(cx, cy) - 30;
    let startAngle = -Math.PI / 2;
    const total = this._totalValue;

    return this.datasets.flatMap((ds, di) =>
      ds.data.map((pt, pi) => {
        const slice = (pt.value / total) * 2 * Math.PI;
        const endAngle = startAngle + slice;
        const path = this._describeArc(cx, cy, r, startAngle, endAngle);
        startAngle = endAngle;
        return {
          path,
          color: ds.color || this._defaultColor(di * ds.data.length + pi),
          label: pt.label,
          value: pt.value,
        };
      }),
    );
  }

  private _describeArc(
    cx: number,
    cy: number,
    r: number,
    startAngle: number,
    endAngle: number,
  ): string {
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    return `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`;
  }

  // ─── Axis helpers ─────────────────────────────────────────────────────────

  get _yTicks(): {y: number; label: string}[] {
    const tickCount = 5;
    return Array.from({length: tickCount + 1}, (_, i) => {
      const fraction = i / tickCount;
      return {
        y: this._plotHeight * (1 - fraction),
        label: String(Math.round(this._maxValue * fraction)),
      };
    });
  }

  xLabelX(index: number): number {
    const labels = this._allLabels;
    if (this.type === 'bar') {
      const groupWidth = this._plotWidth / (labels.length || 1);
      return index * groupWidth + groupWidth / 2;
    }
    const step = this._plotWidth / Math.max(labels.length - 1, 1);
    return index * step;
  }

  // ─── Legend helpers ───────────────────────────────────────────────────────

  get _legendItems(): {color: string; label: string}[] {
    return this.datasets.map((ds, i) => ({
      color: ds.color || this._defaultColor(i),
      label: ds.label,
    }));
  }

  // ─── Tooltip state ────────────────────────────────────────────────────────

  _tooltip: {x: number; y: number; text: string} | null = null;

  showTooltipAt(event: MouseEvent, text: string): void {
    if (!this.showTooltip) return;
    const rect = (event.currentTarget as SVGElement).closest('svg')!.getBoundingClientRect();
    this._tooltip = {
      x: event.clientX - rect.left + 8,
      y: event.clientY - rect.top - 28,
      text,
    };
  }

  hideTooltip(): void {
    this._tooltip = null;
  }

  // ─── Utilities ────────────────────────────────────────────────────────────

  _defaultColor(index: number): string {
    const palette = [
      'var(--mat-sys-primary)',
      'var(--mat-sys-secondary)',
      'var(--mat-sys-tertiary)',
      'var(--mat-sys-error)',
      '#4caf50',
      '#ff9800',
      '#9c27b0',
      '#00bcd4',
    ];
    return palette[index % palette.length];
  }

  _trackByLabel(_: number, item: {label: string}): string {
    return item.label;
  }

  _trackByIndex(index: number): number {
    return index;
  }

  /** Returns the value for a given label from a data array. Used in the template. */
  valueFor(data: MatChartDataset['data'], label: string): number {
    return data.find(pt => pt.label === label)?.value ?? 0;
  }
}
