import {Component, ViewEncapsulation} from '@angular/core';
import {
  MAT_TOOLTIP_DEFAULT_OPTIONS,
  MAT_TOOLTIP_DEFAULT_OPTIONS_FACTORY,
  MatTooltipDefaultOptions,
  MatTooltipModule,
} from '@angular/material/tooltip';
import {MatButtonModule} from '@angular/material/button';

/** Custom options the configure the tooltip's default class. */
export const myCustomTooltipDefaults: MatTooltipDefaultOptions = {
  ...MAT_TOOLTIP_DEFAULT_OPTIONS_FACTORY(),
  tooltipClass: 'example-tooltip-default-custom-class',
};

/**
 * @title Tooltip with default custom class
 */
@Component({
  selector: 'tooltip-default-custom-class-example',
  templateUrl: 'tooltip-default-custom-class-example.html',
  styleUrl: 'tooltip-default-custom-class-example.css',
  providers: [{provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: myCustomTooltipDefaults}],
  standalone: true,
  // Need to remove view encapsulation so that the custom tooltip style defined in
  // `tooltip-default-custom-class-example.css` will not be scoped to this component's view.
  encapsulation: ViewEncapsulation.None,
  imports: [MatButtonModule, MatTooltipModule],
})
export class TooltipDefaultCustomClassExample {}
