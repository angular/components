/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {MatChart} from './chart';
import {MatChartsModule} from './charts-module';
import {MatChartDataset} from './chart-types';

const DATASETS: MatChartDataset[] = [
  {
    label: 'Series A',
    data: [
      {label: 'Jan', value: 10},
      {label: 'Feb', value: 20},
      {label: 'Mar', value: 15},
    ],
  },
  {
    label: 'Series B',
    data: [
      {label: 'Jan', value: 5},
      {label: 'Feb', value: 25},
      {label: 'Mar', value: 30},
    ],
  },
];

@Component({
  standalone: true,
  template: `
    <mat-chart
      [type]="type"
      [datasets]="datasets"
      [label]="label"
      [showLegend]="showLegend"
      [showTooltip]="showTooltip"
      [height]="300">
    </mat-chart>
  `,
  imports: [MatChartsModule],
})
class TestHostComponent {
  type: MatChart['type'] = 'bar';
  datasets: MatChartDataset[] = DATASETS;
  label = 'Test Chart';
  showLegend = true;
  showTooltip = true;
}

/** Helper: get the MatChart instance from the fixture. */
function getChart(fixture: ComponentFixture<TestHostComponent>): MatChart {
  return fixture.debugElement.query(By.directive(MatChart)).componentInstance as MatChart;
}

describe('MatChart', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();

    // JSDOM has no layout engine so getBoundingClientRect() returns 0.
    // Manually set _svgWidth so chart content renders in all tests.
    const chart = getChart(fixture);
    chart._svgWidth = 400;
    chart._svgHeight = 300;
    fixture.detectChanges();
  });

  // ── Creation ──────────────────────────────────────────────────────────────

  it('should create the component', () => {
    expect(fixture.debugElement.query(By.directive(MatChart))).toBeTruthy();
  });

  // ── Host classes ──────────────────────────────────────────────────────────

  it('should apply mat-chart class to host', () => {
    const el: HTMLElement = fixture.nativeElement.querySelector('mat-chart');
    expect(el.classList).toContain('mat-chart');
  });

  it('should apply mat-chart-bar class for bar type', () => {
    expect(fixture.nativeElement.querySelector('mat-chart').classList).toContain('mat-chart-bar');
  });

  it('should apply mat-chart-line class for line type', () => {
    host.type = 'line';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('mat-chart').classList).toContain('mat-chart-line');
  });

  it('should apply mat-chart-pie class for pie type', () => {
    host.type = 'pie';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('mat-chart').classList).toContain('mat-chart-pie');
  });

  // ── Label ─────────────────────────────────────────────────────────────────

  it('should render the label', () => {
    const el = fixture.nativeElement.querySelector('.mat-chart-label');
    expect(el?.textContent?.trim()).toBe('Test Chart');
  });

  it('should not render label element when label is empty', () => {
    host.label = '';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.mat-chart-label')).toBeNull();
  });

  // ── SVG ───────────────────────────────────────────────────────────────────

  it('should render an SVG element', () => {
    expect(fixture.nativeElement.querySelector('svg.mat-chart-svg')).toBeTruthy();
  });

  // ── Accessibility ─────────────────────────────────────────────────────────

  it('should have role="img" on the host element', () => {
    const el: HTMLElement = fixture.nativeElement.querySelector('mat-chart');
    expect(el.getAttribute('role')).toBe('img');
  });

  it('should set aria-label from label input', () => {
    const el: HTMLElement = fixture.nativeElement.querySelector('mat-chart');
    expect(el.getAttribute('aria-label')).toBe('Test Chart');
  });

  it('should prefer aria-label input over label for aria-label attribute', () => {
    const chart = getChart(fixture);
    chart.ariaLabel = 'Custom ARIA';
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement.querySelector('mat-chart');
    expect(el.getAttribute('aria-label')).toBe('Custom ARIA');
  });

  // ── Legend ────────────────────────────────────────────────────────────────

  it('should render the legend when showLegend is true', () => {
    expect(fixture.nativeElement.querySelector('.mat-chart-legend')).toBeTruthy();
  });

  it('should not render the legend when showLegend is false', () => {
    host.showLegend = false;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.mat-chart-legend')).toBeNull();
  });

  it('should render correct number of legend items', () => {
    const items = fixture.nativeElement.querySelectorAll('.mat-chart-legend-item');
    expect(items.length).toBe(DATASETS.length);
  });

  // ── Computed data helpers ─────────────────────────────────────────────────

  it('should compute _allLabels from datasets', () => {
    expect(getChart(fixture)._allLabels).toEqual(['Jan', 'Feb', 'Mar']);
  });

  it('should compute _maxValue from datasets', () => {
    expect(getChart(fixture)._maxValue).toBe(30);
  });

  it('should compute _totalValue across all datasets', () => {
    // 10+20+15 + 5+25+30 = 105
    expect(getChart(fixture)._totalValue).toBe(105);
  });

  it('should return 1 for _maxValue when datasets are empty', () => {
    host.datasets = [];
    fixture.detectChanges();
    expect(getChart(fixture)._maxValue).toBe(1);
  });

  it('should return 1 for _totalValue when datasets are empty', () => {
    host.datasets = [];
    fixture.detectChanges();
    expect(getChart(fixture)._totalValue).toBe(1);
  });

  // ── valueFor ─────────────────────────────────────────────────────────────

  it('should return correct value from valueFor()', () => {
    const chart = getChart(fixture);
    expect(chart.valueFor(DATASETS[0].data, 'Feb')).toBe(20);
  });

  it('should return 0 from valueFor() for a missing label', () => {
    const chart = getChart(fixture);
    expect(chart.valueFor(DATASETS[0].data, 'Missing')).toBe(0);
  });

  // ── Line chart ────────────────────────────────────────────────────────────

  it('should generate a valid SVG linePath starting with M', () => {
    const chart = getChart(fixture);
    const path = chart.linePath(DATASETS[0]);
    expect(path).toMatch(/^M/);
    expect(path).toContain('L');
  });

  it('should return empty string for linePath with no data', () => {
    const chart = getChart(fixture);
    expect(chart.linePath({label: 'Empty', data: []})).toBe('');
  });

  // ── Pie chart ─────────────────────────────────────────────────────────────

  it('should generate pie slices equal to total data points across all datasets', () => {
    host.type = 'pie';
    fixture.detectChanges();
    // 2 datasets × 3 points = 6 slices
    expect(getChart(fixture)._pieSlices.length).toBe(6);
  });

  it('each pie slice path should start with M', () => {
    host.type = 'pie';
    fixture.detectChanges();
    for (const slice of getChart(fixture)._pieSlices) {
      expect(slice.path).toMatch(/^M/);
    }
  });

  // ── Y-axis ticks ──────────────────────────────────────────────────────────

  it('should generate 6 y-axis ticks (0 through 5)', () => {
    expect(getChart(fixture)._yTicks.length).toBe(6);
  });

  it('first y-tick label should be "0"', () => {
    expect(getChart(fixture)._yTicks[0].label).toBe('0');
  });

  it('last y-tick label should equal _maxValue', () => {
    const chart = getChart(fixture);
    expect(getChart(fixture)._yTicks[5].label).toBe(String(chart._maxValue));
  });

  // ── Bar helpers ───────────────────────────────────────────────────────────

  it('barWidth() should return a positive number', () => {
    expect(getChart(fixture).barWidth()).toBeGreaterThan(0);
  });

  it('barX() should return 0 for the first bar in a group', () => {
    expect(getChart(fixture).barX(0)).toBe(0);
  });

  // ── Default colors ────────────────────────────────────────────────────────

  it('_defaultColor should cycle through the palette', () => {
    const chart = getChart(fixture);
    const c0 = chart._defaultColor(0);
    const c8 = chart._defaultColor(8); // palette length is 8, so index 8 === index 0
    expect(c0).toBe(c8);
  });

  // ── Tooltip ───────────────────────────────────────────────────────────────

  it('hideTooltip() should set _tooltip to null', () => {
    const chart = getChart(fixture);
    chart._tooltip = {x: 10, y: 10, text: 'test'};
    chart.hideTooltip();
    expect(chart._tooltip).toBeNull();
  });

  it('showTooltipAt() should not set _tooltip when showTooltip is false', () => {
    host.showTooltip = false;
    fixture.detectChanges();
    const chart = getChart(fixture);
    const fakeEvent = {
      currentTarget: {closest: () => ({getBoundingClientRect: () => ({left: 0, top: 0})})},
      clientX: 50,
      clientY: 50,
    } as unknown as MouseEvent;
    chart.showTooltipAt(fakeEvent, 'hello');
    expect(chart._tooltip).toBeNull();
  });

  // ── Edge cases ────────────────────────────────────────────────────────────

  it('should handle empty datasets without throwing', () => {
    host.datasets = [];
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should handle a single data point without throwing', () => {
    host.datasets = [{label: 'Only', data: [{label: 'A', value: 5}]}];
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should update when datasets input changes', () => {
    const chart = getChart(fixture);
    const before = chart._maxValue;
    host.datasets = [{label: 'X', data: [{label: 'A', value: 999}]}];
    fixture.detectChanges();
    expect(getChart(fixture)._maxValue).not.toBe(before);
    expect(getChart(fixture)._maxValue).toBe(999);
  });
});
