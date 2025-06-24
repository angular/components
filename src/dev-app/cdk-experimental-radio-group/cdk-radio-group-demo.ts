/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {
  CdkRadioGroupConfigurableExample,
  CdkRadioGroupStandardExample,
  CdkRadioGroupHorizontalExample,
  CdkRadioGroupRtlHorizontalExample,
  CdkRadioGroupActiveDescendantExample,
  CdkRadioGroupDisabledFocusableExample,
  CdkRadioGroupDisabledSkippedExample,
  CdkRadioGroupReadonlyExample,
  CdkRadioGroupDisabledExample,
} from '@angular/components-examples/cdk-experimental/radio-group';

@Component({
  templateUrl: 'cdk-radio-group-demo.html',
  imports: [
    CdkRadioGroupStandardExample,
    CdkRadioGroupHorizontalExample,
    CdkRadioGroupRtlHorizontalExample,
    CdkRadioGroupActiveDescendantExample,
    CdkRadioGroupDisabledFocusableExample,
    CdkRadioGroupDisabledSkippedExample,
    CdkRadioGroupReadonlyExample,
    CdkRadioGroupDisabledExample,
    CdkRadioGroupConfigurableExample,
  ],
  styleUrl: './cdk-radio-group-demo.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdkExperimentalRadioGroupDemo {}
