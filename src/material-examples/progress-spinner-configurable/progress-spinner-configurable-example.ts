import {Component} from '@angular/core';
import {ThemePalette} from '@angular/material/core';

/**
 * @title Configurable progress spinner
 */
@Component({
  selector: 'progress-spinner-configurable-example',
  templateUrl: 'progress-spinner-configurable-example.html',
  styleUrls: ['progress-spinner-configurable-example.css'],
})
export class ProgressSpinnerConfigurableExample {
  color: ThemePalette = 'primary';
  mode: 'determinate' | 'indeterminate' = 'determinate';
  value = 50;
}
