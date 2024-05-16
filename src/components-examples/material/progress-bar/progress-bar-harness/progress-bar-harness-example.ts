import {Component, signal} from '@angular/core';
import {MatProgressBarModule} from '@angular/material/progress-bar';

/**
 * @title Testing with MatProgressBarHarness
 */
@Component({
  selector: 'progress-bar-harness-example',
  templateUrl: 'progress-bar-harness-example.html',
  standalone: true,
  imports: [MatProgressBarModule],
})
export class ProgressBarHarnessExample {
  value = signal<number | undefined>(undefined);
}
