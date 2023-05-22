import {Component} from '@angular/core';
import {ThemePalette} from '@angular/material/core';
import {ProgressSpinnerMode, MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSliderModule} from '@angular/material/slider';
import {NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatRadioModule} from '@angular/material/radio';
import {MatCardModule} from '@angular/material/card';

/**
 * @title Configurable progress spinner
 */
@Component({
  selector: 'progress-spinner-configurable-example',
  templateUrl: 'progress-spinner-configurable-example.html',
  styleUrls: ['progress-spinner-configurable-example.css'],
  standalone: true,
  imports: [
    MatCardModule,
    MatRadioModule,
    FormsModule,
    NgIf,
    MatSliderModule,
    MatProgressSpinnerModule,
  ],
})
export class ProgressSpinnerConfigurableExample {
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'determinate';
  value = 50;
}
