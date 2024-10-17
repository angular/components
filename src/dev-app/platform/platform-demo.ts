/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {Platform, getSupportedInputTypes} from '@angular/cdk/platform';

@Component({
  selector: 'platform-demo',
  templateUrl: 'platform-demo.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlatformDemo {
  platform = inject(Platform);

  supportedInputTypes = getSupportedInputTypes();
}
