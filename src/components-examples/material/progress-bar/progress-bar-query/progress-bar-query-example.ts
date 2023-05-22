import {Component} from '@angular/core';
import {MatProgressBarModule} from '@angular/material/progress-bar';

/**
 * @title Query progress-bar
 */
@Component({
  selector: 'progress-bar-query-example',
  templateUrl: 'progress-bar-query-example.html',
  standalone: true,
  imports: [MatProgressBarModule],
})
export class ProgressBarQueryExample {}
