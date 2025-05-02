/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CdkRadioExample} from '@angular/components-examples/cdk-experimental/radio';

@Component({
  templateUrl: 'cdk-radio-demo.html',
  imports: [CdkRadioExample],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdkExperimentalRadioDemo {}
