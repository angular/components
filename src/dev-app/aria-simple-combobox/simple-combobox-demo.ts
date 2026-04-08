/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {
  SimpleComboboxListboxExample,
  SimpleComboboxTreeExample,
  SimpleComboboxSelectExample,
  SimpleComboboxGridExample,
  SimpleComboboxDatepickerExample,
  SimpleComboboxAutoSelectExample,
  SimpleComboboxHighlightExample,
  SimpleComboboxDisabledExample,
  SimpleComboboxReadonlyDisabledExample,
  SimpleComboboxReadonlyMultiselectExample,
  SimpleComboboxDialogExample,
  SimpleComboboxTreeAutoSelectExample,
  SimpleComboboxTreeHighlightExample,
} from '@angular/components-examples/aria/simple-combobox';

@Component({
  templateUrl: 'simple-combobox-demo.html',
  styleUrl: 'simple-combobox-demo.css',
  imports: [
    SimpleComboboxListboxExample,
    SimpleComboboxTreeExample,
    SimpleComboboxSelectExample,
    SimpleComboboxGridExample,
    SimpleComboboxDatepickerExample,
    SimpleComboboxAutoSelectExample,
    SimpleComboboxHighlightExample,
    SimpleComboboxDisabledExample,
    SimpleComboboxReadonlyDisabledExample,
    SimpleComboboxReadonlyMultiselectExample,
    SimpleComboboxDialogExample,
    SimpleComboboxTreeAutoSelectExample,
    SimpleComboboxTreeHighlightExample,
  ],
})
export class ComboboxDemo {}
