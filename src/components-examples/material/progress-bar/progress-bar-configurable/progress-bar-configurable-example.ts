import {Component} from '@angular/core';
import {ProgressBarMode, MatProgressBarModule} from '@angular/material/progress-bar';
import {MatSliderModule} from '@angular/material/slider';
import {FormsModule} from '@angular/forms';
import {MatRadioModule} from '@angular/material/radio';
import {MatCardModule} from '@angular/material/card';

/**
 * @title Configurable progress-bar
 */
@Component({
  selector: 'progress-bar-configurable-example',
  templateUrl: 'progress-bar-configurable-example.html',
  styleUrl: 'progress-bar-configurable-example.css',
  imports: [MatCardModule, MatRadioModule, FormsModule, MatSliderModule, MatProgressBarModule],
})
export class ProgressBarConfigurableExample {
  mode: ProgressBarMode = 'determinate';
  value = 50;
  bufferValue = 75;
}
