/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';


@Component({
  selector: 'mdc-slider-demo',
  templateUrl: 'mdc-slider-demo.html',
})
export class MdcSliderDemo {
  changingNum: number = 0;
  changingBool: boolean = true;

  toggleNumForever(v1: any, v2: any, time: number) {
    setTimeout(() => {
      this.changingNum = this.changingNum === v1 ? v2 : v1;
      this.toggleNumForever(v1, v2, time);
    }, time);
  }

  toggleBoolForever(time: number) {
    setTimeout(() => {
      this.changingBool = !this.changingBool;
      this.toggleBoolForever(time);
    }, time);
  }

  constructor() {
    this.toggleNumForever(0, 10, 3000);
    this.toggleBoolForever(3000)
  }
}
