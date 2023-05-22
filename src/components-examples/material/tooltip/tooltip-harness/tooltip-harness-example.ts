import {Component} from '@angular/core';
import {MatTooltipModule} from '@angular/material/tooltip';

/**
 * @title Testing with MatTooltipHarness
 */
@Component({
  selector: 'tooltip-harness-example',
  templateUrl: 'tooltip-harness-example.html',
  standalone: true,
  imports: [MatTooltipModule],
})
export class TooltipHarnessExample {
  message = 'Tooltip message';
}
