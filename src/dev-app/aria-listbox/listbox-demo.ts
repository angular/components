/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {
  ListboxConfigurableExample,
  ListboxSingleSelectExample,
  ListboxMultiSelectExample,
  ListboxSingleSelectFollowFocusExample,
  ListboxMultiSelectFollowFocusExample,
  ListboxHorizontalExample,
  ListboxRtlHorizontalExample,
  ListboxActiveDescendantExample,
  ListboxDisabledFocusableExample,
  ListboxDisabledSkippedExample,
  ListboxReadonlyExample,
  ListboxDisabledExample,
} from '@angular/components-examples/aria/listbox';

@Component({
  templateUrl: 'listbox-demo.html',
  imports: [
    ListboxConfigurableExample,
    ListboxSingleSelectExample,
    ListboxMultiSelectExample,
    ListboxSingleSelectFollowFocusExample,
    ListboxMultiSelectFollowFocusExample,
    ListboxHorizontalExample,
    ListboxRtlHorizontalExample,
    ListboxActiveDescendantExample,
    ListboxDisabledFocusableExample,
    ListboxDisabledSkippedExample,
    ListboxReadonlyExample,
    ListboxDisabledExample,
  ],
  styleUrl: 'listbox-demo.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListboxDemo {}
