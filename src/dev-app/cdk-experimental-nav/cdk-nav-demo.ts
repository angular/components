/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CdkNavExample} from '@angular/components-examples/cdk-experimental/nav';

@Component({
  templateUrl: 'cdk-nav-demo.html',
  imports: [CdkNavExample],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdkExperimentalNavDemo {}
