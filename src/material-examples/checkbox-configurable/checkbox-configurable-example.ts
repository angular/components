/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';

/**
 * @title Configurable checkbox
 */
@Component({
  selector: 'checkbox-configurable-example',
  templateUrl: 'checkbox-configurable-example.html',
  styleUrls: ['checkbox-configurable-example.css'],
})
export class CheckboxConfigurableExample {
  checked = false;
  indeterminate = false;
  align = 'start';
  disabled = false;
}
