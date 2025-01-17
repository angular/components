import {Component} from '@angular/core';
import {MatSliderModule} from '@angular/material/slider';

/**
 * @title Range slider
 */
@Component({
  selector: 'slider-range-example',
  templateUrl: 'slider-range-example.html',
  styleUrl: 'slider-range-example.css',
  imports: [MatSliderModule],
})
export class SliderRangeExample {}
