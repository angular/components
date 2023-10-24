/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatCommonModule, MatRippleModule} from '@angular/material/core';
import {MatSlider} from './slider';
import {MatSliderVisualThumb} from './slider-thumb';
import {MatSliderThumb, MatSliderRangeThumb} from './slider-input';

@NgModule({
  imports: [MatCommonModule, MatRippleModule],
  exports: [MatSlider, MatSliderThumb, MatSliderRangeThumb],
  declarations: [MatSlider, MatSliderThumb, MatSliderRangeThumb, MatSliderVisualThumb],
})
export class MatSliderModule {}
