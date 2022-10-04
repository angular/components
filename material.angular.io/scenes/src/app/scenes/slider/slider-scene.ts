import {AfterViewInit, Component, NgModule, ViewChild, ViewEncapsulation} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacySlider as MatSlider, MatLegacySliderModule as MatSliderModule} from '@angular/material/legacy-slider';


@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-slider-scene',
  templateUrl: './slider-scene.html',
  styleUrls: ['./slider-scene.scss']
})
export class SliderScene implements AfterViewInit {
  @ViewChild('volume') volume!: MatSlider;

  ngAfterViewInit() {
    this.volume.focus();
  }
}

@NgModule({
  imports: [
    MatIconModule,
    MatSliderModule
  ],
  exports: [SliderScene],
  declarations: [SliderScene]
})
export class SliderSceneModule {}

