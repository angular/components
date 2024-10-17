import {Component} from '@angular/core';
import {MatSliderModule} from '@angular/material/slider';

/**
 * @title Basic slider
 */
@Component({
  selector: 'slider-overview-example',
  templateUrl: 'slider-overview-example.html',
  styleUrl: 'slider-overview-example.css',
  imports: [MatSliderModule],
})
export class SliderOverviewExample {}
