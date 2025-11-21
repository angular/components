/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

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
