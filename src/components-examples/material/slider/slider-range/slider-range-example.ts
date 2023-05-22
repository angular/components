import {Component} from '@angular/core';
import {MatSliderModule} from '@angular/material/slider';

/**
 * @title Range slider
 */
@Component({
  selector: 'slider-range-example',
  templateUrl: 'slider-range-example.html',
  styleUrls: ['slider-range-example.css'],
  standalone: true,
  imports: [MatSliderModule],
})
export class SliderRangeExample {}
