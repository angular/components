/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ComboboxAutoSelectExample,
  ComboboxHighlightExample,
  ComboboxManualExample,
  ComboboxTreeAutoSelectExample,
  ComboboxTreeHighlightExample,
  ComboboxTreeManualExample,
  ComboboxReadonlyExample,
} from '@angular/components-examples/aria/combobox';
import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  templateUrl: 'combobox-demo.html',
  styleUrl: 'combobox-demo.css',
  imports: [
    ComboboxManualExample,
    ComboboxAutoSelectExample,
    ComboboxHighlightExample,
    ComboboxTreeManualExample,
    ComboboxTreeAutoSelectExample,
    ComboboxTreeHighlightExample,
    ComboboxReadonlyExample,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComboboxDemo {}
