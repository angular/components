/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {
  CdkListboxActivedescendantExample,
  CdkListboxCompareWithExample,
  CdkListboxCustomNavigationExample,
  CdkListboxCustomTypeaheadExample,
  CdkListboxDisabledExample,
  CdkListboxFormsValidationExample,
  CdkListboxHorizontalExample,
  CdkListboxMultipleExample,
  CdkListboxOverviewExample,
  CdkListboxReactiveFormsExample,
  CdkListboxTemplateFormsExample,
  CdkListboxValueBindingExample,
} from '@angular/components-examples/cdk/listbox';

@Component({
  templateUrl: 'cdk-listbox-demo.html',
  imports: [
    CdkListboxActivedescendantExample,
    CdkListboxCompareWithExample,
    CdkListboxCustomNavigationExample,
    CdkListboxCustomTypeaheadExample,
    CdkListboxDisabledExample,
    CdkListboxFormsValidationExample,
    CdkListboxHorizontalExample,
    CdkListboxMultipleExample,
    CdkListboxOverviewExample,
    CdkListboxReactiveFormsExample,
    CdkListboxTemplateFormsExample,
    CdkListboxValueBindingExample,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdkListboxDemo {}
