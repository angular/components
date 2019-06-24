import {Component} from '@angular/core';
import {ThemePalette} from '@angular/material/core';

/**
 * @title Configurable progress-bar
 */
@Component({
  selector: 'progress-bar-configurable-example',
  templateUrl: 'progress-bar-configurable-example.html',
  styleUrls: ['progress-bar-configurable-example.css'],
})
export class ProgressBarConfigurableExample {
  color: ThemePalette = 'primary';
  mode: 'determinate' | 'indeterminate' | 'buffer' | 'query' = 'determinate';
  value = 50;
  bufferValue = 75;
}
