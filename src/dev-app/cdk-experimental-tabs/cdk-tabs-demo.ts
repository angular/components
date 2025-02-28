/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CdkTabsExample} from '@angular/components-examples/cdk-experimental/tabs';

@Component({
  templateUrl: 'cdk-tabs-demo.html',
  imports: [CdkTabsExample],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdkExperimentalTabsDemo {}
