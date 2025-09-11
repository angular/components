/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive, input} from '@angular/core';

@Directive({
  selector: 'input[cdkComboboxInput]',
  exportAs: 'cdkComboboxInput',
  host: {'role': 'combobox'},
})
export class CdkComboboxInput {
  readonly popup = input.required<CdkComboboxPopup>();
}

@Directive({
  selector: '[cdkComboboxPopup]',
  exportAs: 'cdkComboboxPopup',
})
export class CdkComboboxPopup {}
