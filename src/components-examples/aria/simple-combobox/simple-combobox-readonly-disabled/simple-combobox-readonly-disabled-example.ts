/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Combobox, ComboboxPopup, ComboboxWidget} from '@angular/aria/simple-combobox';
import {Listbox, Option} from '@angular/aria/listbox';
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import {OverlayModule} from '@angular/cdk/overlay';

/** @title Disabled readonly combobox. */
@Component({
  selector: 'simple-combobox-readonly-disabled-example',
  templateUrl: 'simple-combobox-readonly-disabled-example.html',
  styleUrl: '../simple-combobox-select/simple-combobox-select-example.css',
  imports: [Combobox, ComboboxPopup, ComboboxWidget, Listbox, Option, OverlayModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleComboboxReadonlyDisabledExample {
  readonly listbox = viewChild(Listbox);

  readonly options = signal([
    {value: 'Select a label', icon: ''},
    {value: 'Important', icon: 'label'},
    {value: 'Starred', icon: 'star'},
    {value: 'Work', icon: 'work'},
    {value: 'Personal', icon: 'person'},
    {value: 'To Do', icon: 'checklist'},
    {value: 'Later', icon: 'schedule'},
    {value: 'Read', icon: 'menu_book'},
    {value: 'Travel', icon: 'flight'},
  ]);
  readonly value = signal<string>('Select a label');
  readonly selectedValues = signal<string[]>(['Select a label']);
  readonly popupExpanded = signal(false);

  constructor() {
    afterRenderEffect(() => {
      this.listbox()?.scrollActiveItemIntoView();
    });
  }

  onCommit() {
    const values = this.selectedValues();
    if (values.length) {
      this.value.set(values[0]);
      this.popupExpanded.set(false);
    }
  }
}
