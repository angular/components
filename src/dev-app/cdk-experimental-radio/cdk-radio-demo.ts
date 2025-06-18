/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {
  CdkRadioStandardExample,
  CdkRadioHorizontalExample,
  CdkRadioRtlHorizontalExample,
  CdkRadioActiveDescendantExample,
  CdkRadioDisabledFocusableExample,
  CdkRadioDisabledSkippedExample,
  CdkRadioReadonlyExample,
  CdkRadioDisabledExample,
} from '@angular/components-examples/cdk-experimental/radio';
import {CdkRadioConfigurableExample} from '../../components-examples/cdk-experimental/radio/cdk-radio-configurable/cdk-radio-configurable-example';

@Component({
  templateUrl: 'cdk-radio-demo.html',
  imports: [
    CdkRadioStandardExample,
    CdkRadioHorizontalExample,
    CdkRadioRtlHorizontalExample,
    CdkRadioActiveDescendantExample,
    CdkRadioDisabledFocusableExample,
    CdkRadioDisabledSkippedExample,
    CdkRadioReadonlyExample,
    CdkRadioDisabledExample,
    CdkRadioConfigurableExample,
  ],
  styleUrl: './cdk-radio-demo.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdkExperimentalRadioDemo {}
