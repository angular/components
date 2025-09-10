/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {BidiModule} from '@angular/cdk/bidi';
import {NgModule} from '@angular/core';
import {MatRippleModule} from '../core';
import {MatSlider} from './slider';
import {MatSliderVisualThumb} from './slider-thumb';
import {MatSliderThumb, MatSliderRangeThumb} from './slider-input';

@NgModule({
  imports: [MatRippleModule, MatSlider, MatSliderThumb, MatSliderRangeThumb, MatSliderVisualThumb],
  exports: [MatSlider, MatSliderThumb, MatSliderRangeThumb, BidiModule],
})
export class MatSliderModule {}
