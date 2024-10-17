import {Component} from '@angular/core';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonModule} from '@angular/material/button';

/**
 * @title Tooltip that can be manually shown/hidden.
 */
@Component({
  selector: 'tooltip-manual-example',
  templateUrl: 'tooltip-manual-example.html',
  styleUrl: 'tooltip-manual-example.css',
  imports: [MatButtonModule, MatTooltipModule],
})
export class TooltipManualExample {}
