import {Component} from '@angular/core';
import {MatProgressBarModule} from '@angular/material/progress-bar';

/**
 * @title Indeterminate progress-bar
 */
@Component({
  selector: 'progress-bar-indeterminate-example',
  templateUrl: 'progress-bar-indeterminate-example.html',
  standalone: true,
  imports: [MatProgressBarModule],
})
export class ProgressBarIndeterminateExample {}
