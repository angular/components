/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'radio-e2e',
  templateUrl: 'radio-e2e.html',
})
export class SimpleRadioButtons {
  isGroupDisabled: boolean = false;
  groupValue: string;
}
