/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {CdkToolbarConfigurableExample} from '@angular/components-examples/cdk-experimental/toolbar';

@Component({
  templateUrl: 'cdk-toolbar-demo.html',
  imports: [CdkToolbarConfigurableExample],
  styleUrl: './cdk-toolbar-demo.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdkExperimentalToolbarDemo {}
