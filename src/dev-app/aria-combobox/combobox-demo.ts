/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {
  ComboboxListboxExample,
  ComboboxTreeExample,
  ComboboxSelectExample,
  ComboboxGridExample,
  ComboboxDatepickerExample,
  ComboboxAutoSelectExample,
  ComboboxHighlightExample,
  ComboboxDisabledExample,
  ComboboxReadonlyDisabledExample,
  ComboboxReadonlyMultiselectExample,
  ComboboxDialogExample,
  ComboboxTreeAutoSelectExample,
  ComboboxTreeHighlightExample,
} from '@angular/components-examples/aria/combobox';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'combobox-demo.html',
  styleUrl: 'combobox-demo.css',
  imports: [
    ComboboxListboxExample,
    ComboboxTreeExample,
    ComboboxSelectExample,
    ComboboxGridExample,
    ComboboxDatepickerExample,
    ComboboxAutoSelectExample,
    ComboboxHighlightExample,
    ComboboxDisabledExample,
    ComboboxReadonlyDisabledExample,
    ComboboxReadonlyMultiselectExample,
    ComboboxDialogExample,
    ComboboxTreeAutoSelectExample,
    ComboboxTreeHighlightExample,
  ],
})
export class ComboboxDemo {}
