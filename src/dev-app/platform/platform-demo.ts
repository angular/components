/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Platform, getSupportedInputTypes} from '@angular/cdk/platform';
import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'platform-demo',
  templateUrl: 'platform-demo.html',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlatformDemo {
  supportedInputTypes = getSupportedInputTypes();

  constructor(public platform: Platform) {}
}
