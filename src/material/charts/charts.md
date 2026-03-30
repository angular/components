# MatChart

`MatChart` is a Material-themed SVG chart component supporting line, bar, and pie chart types.

## Usage

```html
<mat-chart
  type="bar"
  label="Monthly Sales"
  [datasets]="datasets"
  [showTooltip]="true"
  [showLegend]="true"
  [height]="300">
</mat-chart>
```

```typescript
import { MatChart, MatChartDataset } from '@angular/material/charts';

datasets: MatChartDataset[] = [
  {
    label: 'Revenue',
    data: [
      { label: 'Jan', value: 120 },
      { label: 'Feb', value: 180 },
      { label: 'Mar', value: 150 },
    ],
  },
];
```

## Theming

```scss
@use '@angular/material' as mat;

@include mat.chart-theme($theme);
```
