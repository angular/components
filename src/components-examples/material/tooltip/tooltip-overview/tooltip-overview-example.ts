import {Component} from '@angular/core';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonModule} from '@angular/material/button';

/**
 * @title Basic tooltip
 */
@Component({
  selector: 'tooltip-overview-example',
  templateUrl: 'tooltip-overview-example.html',
  standalone: true,
  imports: [MatButtonModule, MatTooltipModule],
})
export class TooltipOverviewExample {}
