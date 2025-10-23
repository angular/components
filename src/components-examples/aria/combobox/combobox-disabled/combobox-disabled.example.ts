/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Combobox, ComboboxInput, ComboboxPopupContainer} from '@angular/aria/combobox';
import {Component, signal} from '@angular/core';

/** @title Combobox disabled example. */
@Component({
  selector: 'combobox-disabled-example',
  templateUrl: 'combobox-disabled-example.html',
  styleUrl: '../combobox-examples.css',
  imports: [Combobox, ComboboxInput, ComboboxPopupContainer],
})
export class ComboboxDisabledExample {
  searchString = signal('Search is disabled');
}
