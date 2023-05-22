import {Component} from '@angular/core';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

/**
 * @title Testing with MatProgressSpinnerHarness
 */
@Component({
  selector: 'progress-spinner-harness-example',
  templateUrl: 'progress-spinner-harness-example.html',
  standalone: true,
  imports: [MatProgressSpinnerModule],
})
export class ProgressSpinnerHarnessExample {
  value: number;
}
