/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Thumb} from '@material/slider';
import {MatSlider} from './slider';

/**
 * Represents a drag event emitted by the MatSlider component.
 */
export interface MatSliderDragEvent {
  /** The MatSlider that was interacted with. */
  source: MatSlider;

  /** The current value of the slider. */
  value: number;

  /** The thumb that was interacted with. */
  thumb: Thumb;
}
