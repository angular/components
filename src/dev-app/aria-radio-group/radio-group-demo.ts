/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {
  RadioGroupConfigurableExample,
  RadioGroupStandardExample,
  RadioGroupHorizontalExample,
  RadioGroupRtlHorizontalExample,
  RadioGroupActiveDescendantExample,
  RadioGroupDisabledFocusableExample,
  RadioGroupDisabledSkippedExample,
  RadioGroupReadonlyExample,
  RadioGroupDisabledExample,
} from '@angular/components-examples/aria/radio-group';

@Component({
  templateUrl: 'radio-group-demo.html',
  imports: [
    RadioGroupStandardExample,
    RadioGroupHorizontalExample,
    RadioGroupRtlHorizontalExample,
    RadioGroupActiveDescendantExample,
    RadioGroupDisabledFocusableExample,
    RadioGroupDisabledSkippedExample,
    RadioGroupReadonlyExample,
    RadioGroupDisabledExample,
    RadioGroupConfigurableExample,
  ],
  styleUrl: './radio-group-demo.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioGroupDemo {}
