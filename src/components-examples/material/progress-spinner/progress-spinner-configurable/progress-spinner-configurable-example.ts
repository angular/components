import {Component} from '@angular/core';
import {ProgressSpinnerMode, MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSliderModule} from '@angular/material/slider';
import {FormsModule} from '@angular/forms';
import {MatRadioModule} from '@angular/material/radio';
import {MatCardModule} from '@angular/material/card';

/**
 * @title Configurable progress spinner
 */
@Component({
  selector: 'progress-spinner-configurable-example',
  templateUrl: 'progress-spinner-configurable-example.html',
  styleUrl: 'progress-spinner-configurable-example.css',
  imports: [MatCardModule, MatRadioModule, FormsModule, MatSliderModule, MatProgressSpinnerModule],
})
export class ProgressSpinnerConfigurableExample {
  mode: ProgressSpinnerMode = 'determinate';
  value = 50;
}
