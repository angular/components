/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {
  CdkTreeConfigurableExample,
  CdkTreeActiveDescendantExample,
  CdkTreeDisabledExample,
  CdkTreeDisabledFocusableExample,
  CdkTreeDisabledSkippedExample,
  CdkTreeMultiSelectExample,
  CdkTreeMultiSelectFollowFocusExample,
  CdkTreeNavExample,
  CdkTreeSingleSelectExample,
  CdkTreeSingleSelectFollowFocusExample,
} from '@angular/components-examples/cdk-experimental/tree';

@Component({
  templateUrl: 'cdk-tree-demo.html',
  imports: [
    CdkTreeConfigurableExample,
    CdkTreeActiveDescendantExample,
    CdkTreeDisabledExample,
    CdkTreeDisabledFocusableExample,
    CdkTreeDisabledSkippedExample,
    CdkTreeMultiSelectExample,
    CdkTreeMultiSelectFollowFocusExample,
    CdkTreeNavExample,
    CdkTreeSingleSelectExample,
    CdkTreeSingleSelectFollowFocusExample,
  ],
  styleUrl: 'cdk-tree-demo.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdkExperimentalTreeDemo {}
