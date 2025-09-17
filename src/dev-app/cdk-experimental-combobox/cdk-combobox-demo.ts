/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  CdkComboboxAutoSelectExample,
  CdkComboboxHighlightExample,
  CdkComboboxManualExample,
  CdkComboboxTreeAutoSelectExample,
  CdkComboboxTreeHighlightExample,
  CdkComboboxTreeManualExample,
} from '@angular/components-examples/cdk-experimental/combobox';
import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  templateUrl: 'cdk-combobox-demo.html',
  styleUrl: 'cdk-combobox-demo.css',
  imports: [
    CdkComboboxManualExample,
    CdkComboboxAutoSelectExample,
    CdkComboboxHighlightExample,
    CdkComboboxTreeManualExample,
    CdkComboboxTreeAutoSelectExample,
    CdkComboboxTreeHighlightExample,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdkComboboxDemo {}
