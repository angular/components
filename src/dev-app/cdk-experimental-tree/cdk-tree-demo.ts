/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CdkTreeExample} from '@angular/components-examples/cdk-experimental/tree';

@Component({
  templateUrl: 'cdk-tree-demo.html',
  imports: [CdkTreeExample],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdkExperimentalTreeDemo {}
