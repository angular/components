import {AfterViewInit, Component, ViewChild, ViewEncapsulation} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatSlider, MatSliderModule} from '@angular/material/slider';


@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-slider-scene',
  templateUrl: './slider-scene.html',
  styleUrls: ['./slider-scene.scss'],
  standalone: true,
  imports: [MatIconModule, MatSliderModule]
})
export class SliderScene implements AfterViewInit {
  @ViewChild('volume') volume!: MatSlider;

  ngAfterViewInit() {
    // TODO: update to new API in Angular v15
    (this.volume as any).focus();
  }
}
