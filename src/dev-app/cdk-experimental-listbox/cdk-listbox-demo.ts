/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {
  CdkListboxConfigurableExample,
  CdkListboxSingleSelectExample,
  CdkListboxMultiSelectExample,
  CdkListboxSingleSelectFollowFocusExample,
  CdkListboxMultiSelectFollowFocusExample,
  CdkListboxHorizontalExample,
  CdkListboxRtlHorizontalExample,
  CdkListboxActiveDescendantExample,
  CdkListboxDisabledFocusableExample,
  CdkListboxDisabledSkippedExample,
  CdkListboxReadonlyExample,
  CdkListboxDisabledExample,
} from '@angular/components-examples/cdk-experimental/listbox';

@Component({
  templateUrl: 'cdk-listbox-demo.html',
  imports: [
    CdkListboxConfigurableExample,
    CdkListboxSingleSelectExample,
    CdkListboxMultiSelectExample,
    CdkListboxSingleSelectFollowFocusExample,
    CdkListboxMultiSelectFollowFocusExample,
    CdkListboxHorizontalExample,
    CdkListboxRtlHorizontalExample,
    CdkListboxActiveDescendantExample,
    CdkListboxDisabledFocusableExample,
    CdkListboxDisabledSkippedExample,
    CdkListboxReadonlyExample,
    CdkListboxDisabledExample,
  ],
  styleUrl: 'cdk-listbox-demo.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdkExperimentalListboxDemo {}
