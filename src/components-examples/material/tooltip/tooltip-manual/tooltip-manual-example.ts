import {Component} from '@angular/core';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonModule} from '@angular/material/button';

/**
 * @title Tooltip that can be manually shown/hidden.
 */
@Component({
  selector: 'tooltip-manual-example',
  templateUrl: 'tooltip-manual-example.html',
  styleUrls: ['tooltip-manual-example.css'],
  standalone: true,
  imports: [MatButtonModule, MatTooltipModule],
})
export class TooltipManualExample {}
