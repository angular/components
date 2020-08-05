/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';

@Component({
  selector: 'mdc-toggle-button-demo',
  templateUrl: 'mdc-toggle-button-demo.html',
  styleUrls: ['mdc-toggle-button-demo.css']
})
export class MdcToggleButtonDemo {
  handleSelected(event: any) {
    console.log(event);
  }

  handleChange(event: any) {
    console.log(event);
  }
}
