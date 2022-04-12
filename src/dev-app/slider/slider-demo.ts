/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';

@Component({
  selector: 'slider-demo',
  templateUrl: 'slider-demo.html',
})
export class SliderDemo {
  demo: number;
  val: number = 50;
  min: number = 0;
  max: number = 100;
  disabledValue = 0;

  valueThatGetsUpdatedByInterval: number = 25;
  maxValueForSliderThatGetsUpdatedByInterval: number = 100;
  intervalThatUpdatesValue: number | undefined = undefined;

  startInterval(): void {
    if (this.intervalThatUpdatesValue != undefined) {
      return;
    }

    this.intervalThatUpdatesValue = setInterval(() => {
      if (this.intervalThatUpdatesValue == undefined) {
        return;
      }

      this.valueThatGetsUpdatedByInterval++;

      if (this.valueThatGetsUpdatedByInterval === this.maxValueForSliderThatGetsUpdatedByInterval) {
        this.valueThatGetsUpdatedByInterval = 0;
      }
    }, 1000);
  }

  stopInterval(): void {
    if (this.intervalThatUpdatesValue == undefined) {
      return;
    }

    clearInterval(this.intervalThatUpdatesValue);
    this.intervalThatUpdatesValue = undefined;
  }
}
