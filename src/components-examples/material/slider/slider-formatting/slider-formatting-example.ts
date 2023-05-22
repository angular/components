import {Component} from '@angular/core';
import {MatSliderModule} from '@angular/material/slider';

/**
 * @title Slider with custom thumb label formatting.
 */
@Component({
  selector: 'slider-formatting-example',
  templateUrl: 'slider-formatting-example.html',
  styleUrls: ['slider-formatting-example.css'],
  standalone: true,
  imports: [MatSliderModule],
})
export class SliderFormattingExample {
  formatLabel(value: number): string {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    }

    return `${value}`;
  }
}
