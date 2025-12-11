/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Combobox,
  ComboboxInput,
  ComboboxPopup,
  ComboboxPopupContainer,
} from '@angular/aria/combobox';
import {Listbox, Option} from '@angular/aria/listbox';
import {ChangeDetectionStrategy, Component} from '@angular/core';
import {OverlayModule} from '@angular/cdk/overlay';

/** @title Aria select disabled example. */
@Component({
  selector: 'select-disabled-example',
  templateUrl: 'select-disabled-example.html',
  styleUrl: '../select.css',
  imports: [
    Combobox,
    ComboboxInput,
    ComboboxPopup,
    ComboboxPopupContainer,
    Listbox,
    Option,
    OverlayModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectDisabledExample {
  /** The items available for selection. */
  items = ['Option 1', 'Option 2', 'Option 3'];
}
