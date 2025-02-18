import {AfterViewInit, Component, ViewEncapsulation} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatSliderModule} from '@angular/material/slider';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-slider-scene',
  templateUrl: './slider-scene.html',
  styleUrls: ['./slider-scene.scss'],
  imports: [MatIconModule, MatSliderModule],
})
export class SliderScene implements AfterViewInit {
  ngAfterViewInit() {
    const volume = document.querySelector('mat-slider input');
    (volume as any).focus();
  }
}
