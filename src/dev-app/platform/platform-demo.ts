/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getSupportedInputTypes, Platform} from '@angular/cdk/platform';
import {Component} from '@angular/core';


@Component({
  selector: 'platform-demo',
  templateUrl: 'platform-demo.html',
})
export class PlatformDemo {
  supportedInputTypes = getSupportedInputTypes();

  constructor(public platform: Platform) {}
}
