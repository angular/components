import {Component} from '@angular/core';
import {MatSliderModule} from '@angular/material/slider';

/**
 * @title Basic slider
 */
@Component({
  selector: 'slider-overview-example',
  templateUrl: 'slider-overview-example.html',
  styleUrls: ['slider-overview-example.css'],
  standalone: true,
  imports: [MatSliderModule],
})
export class SliderOverviewExample {}
