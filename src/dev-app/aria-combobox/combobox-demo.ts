/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ComboboxDialogExample,
  ComboboxAutoSelectExample,
  ComboboxHighlightExample,
  ComboboxManualExample,
  ComboboxReadonlyExample,
  ComboboxReadonlyMultiselectExample,
  ComboboxTreeAutoSelectExample,
  ComboboxTreeHighlightExample,
  ComboboxTreeManualExample,
} from '@angular/components-examples/aria/combobox';
import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  templateUrl: 'combobox-demo.html',
  styleUrl: 'combobox-demo.css',
  imports: [
    ComboboxDialogExample,
    ComboboxManualExample,
    ComboboxAutoSelectExample,
    ComboboxHighlightExample,
    ComboboxReadonlyExample,
    ComboboxReadonlyMultiselectExample,
    ComboboxTreeManualExample,
    ComboboxTreeAutoSelectExample,
    ComboboxTreeHighlightExample,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComboboxDemo {}
