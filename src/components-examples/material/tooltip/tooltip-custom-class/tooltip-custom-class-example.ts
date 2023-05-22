import {Component, ViewEncapsulation} from '@angular/core';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonModule} from '@angular/material/button';

/**
 * @title Tooltip that can have a custom class applied.
 */
@Component({
  selector: 'tooltip-custom-class-example',
  templateUrl: 'tooltip-custom-class-example.html',
  styleUrls: ['tooltip-custom-class-example.css'],
  // Need to remove view encapsulation so that the custom tooltip style defined in
  // `tooltip-custom-class-example.css` will not be scoped to this component's view.
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [MatButtonModule, MatTooltipModule],
})
export class TooltipCustomClassExample {}
