/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {
  TabsConfigurableExample,
  TabsExplicitSelectionExample,
  TabsSelectionFollowsFocusExample,
  TabsVerticalExample,
  TabsRtlExample,
  TabsActiveDescendantExample,
  TabsDisabledFocusableExample,
  TabsDisabledSkippedExample,
  TabsDisabledExample,
  TabsScrollableExample,
} from '@angular/components-examples/aria/tabs';

@Component({
  selector: 'aria-tabs-demo',
  templateUrl: 'tabs-demo.html',
  styleUrls: ['tabs-demo.css'],
  imports: [
    TabsConfigurableExample,
    TabsExplicitSelectionExample,
    TabsSelectionFollowsFocusExample,
    TabsVerticalExample,
    TabsRtlExample,
    TabsActiveDescendantExample,
    TabsDisabledFocusableExample,
    TabsDisabledSkippedExample,
    TabsDisabledExample,
    TabsScrollableExample,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsDemo {}
