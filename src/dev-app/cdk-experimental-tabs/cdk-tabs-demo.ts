/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {
  CdkTabsConfigurableExample,
  CdkTabsExplicitSelectionExample,
  CdkTabsSelectionFollowsFocusExample,
  CdkTabsVerticalExample,
  CdkTabsRtlExample,
  CdkTabsActiveDescendantExample,
  CdkTabsDisabledFocusableExample,
  CdkTabsDisabledSkippedExample,
  CdkTabsDisabledExample,
} from '@angular/components-examples/cdk-experimental/tabs';

@Component({
  selector: 'cdk-experimental-tabs-demo',
  templateUrl: 'cdk-tabs-demo.html',
  styleUrls: ['cdk-tabs-demo.css'],
  imports: [
    CdkTabsConfigurableExample,
    CdkTabsExplicitSelectionExample,
    CdkTabsSelectionFollowsFocusExample,
    CdkTabsVerticalExample,
    CdkTabsRtlExample,
    CdkTabsActiveDescendantExample,
    CdkTabsDisabledFocusableExample,
    CdkTabsDisabledSkippedExample,
    CdkTabsDisabledExample,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdkExperimentalTabsDemo {}
