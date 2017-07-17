/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
import {CommonModule} from '@angular/common';
import {BidiModule} from '@angular/cdk';
import {MdCommonModule, GestureConfig, StyleModule} from '../core';
import {MdSlider} from './slider';


@NgModule({
  imports: [CommonModule, MdCommonModule, StyleModule, BidiModule],
  exports: [MdSlider, MdCommonModule],
  declarations: [MdSlider],
  providers: [{provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig}]
})
export class MdSliderModule {}


export * from './slider';
