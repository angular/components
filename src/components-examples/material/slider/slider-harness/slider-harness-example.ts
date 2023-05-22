import {Component} from '@angular/core';
import {MatSliderModule} from '@angular/material/slider';

/**
 * @title Testing with MatSliderHarness
 */
@Component({
  selector: 'slider-harness-example',
  templateUrl: 'slider-harness-example.html',
  standalone: true,
  imports: [MatSliderModule],
})
export class SliderHarnessExample {}
