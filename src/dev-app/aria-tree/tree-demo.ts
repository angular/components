/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {
  TreeConfigurableExample,
  TreeActiveDescendantExample,
  TreeDisabledExample,
  TreeDisabledFocusableExample,
  TreeDisabledSkippedExample,
  TreeMultiSelectExample,
  TreeMultiSelectFollowFocusExample,
  TreeNavExample,
  TreeSingleSelectExample,
  TreeSingleSelectFollowFocusExample,
  TreeNavRtlExample,
} from '@angular/components-examples/aria/tree';

@Component({
  templateUrl: 'tree-demo.html',
  imports: [
    TreeConfigurableExample,
    TreeActiveDescendantExample,
    TreeDisabledExample,
    TreeDisabledFocusableExample,
    TreeDisabledSkippedExample,
    TreeMultiSelectExample,
    TreeMultiSelectFollowFocusExample,
    TreeNavExample,
    TreeNavRtlExample,
    TreeSingleSelectExample,
    TreeSingleSelectFollowFocusExample,
  ],
  styleUrl: 'tree-demo.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeDemo {}
