/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Combobox, ComboboxPopup, ComboboxWidget} from '@angular/aria/combobox';
import {Listbox, Option} from '@angular/aria/listbox';
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
  viewChild,
} from '@angular/core';
import {OverlayModule} from '@angular/cdk/overlay';

/** @title Readonly multiselectable combobox. */
@Component({
  selector: 'combobox-readonly-multiselect-example',
  templateUrl: 'combobox-readonly-multiselect-example.html',
  styleUrl: '../combobox-select/combobox-select-example.css',
  imports: [Combobox, ComboboxPopup, ComboboxWidget, Listbox, Option, OverlayModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComboboxReadonlyMultiselectExample {
  readonly listbox = viewChild(Listbox);

  readonly options = signal([
    {value: 'Important', icon: 'label'},
    {value: 'Starred', icon: 'star'},
    {value: 'Work', icon: 'work'},
    {value: 'Personal', icon: 'person'},
    {value: 'To Do', icon: 'checklist'},
    {value: 'Later', icon: 'schedule'},
    {value: 'Read', icon: 'menu_book'},
    {value: 'Travel', icon: 'flight'},
  ]);
  readonly selectedValues = signal<string[]>([]);
  readonly value = computed(() => {
    const values = this.selectedValues();
    if (values.length === 0) {
      return 'Select a label';
    } else if (values.length === 1) {
      return values[0];
    } else {
      return `${values[0]} + ${values.length - 1} more`;
    }
  });
  readonly popupExpanded = signal(false);

  constructor() {
    afterRenderEffect(() => {
      this.listbox()?.scrollActiveItemIntoView();
    });
  }
}
