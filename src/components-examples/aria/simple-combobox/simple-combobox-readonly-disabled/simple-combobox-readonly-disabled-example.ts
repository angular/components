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
  styleUrl: '../simple-combobox-examples.css',
  imports: [Combobox, ComboboxPopup, ComboboxWidget, Listbox, Option, OverlayModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleComboboxReadonlyDisabledExample {
  /** The string that is displayed in the combobox. */
  displayValue = signal('');

  /** The combobox listbox popup. */
  listbox = viewChild<Listbox<string>>(Listbox);

  /** The options available in the listbox. */
  optionsList = viewChildren<Option<string>>(Option);

  popupExpanded = signal(false);

  /** The labels that are available for selection. */
  labels = [
    {value: 'Important', icon: 'label'},
    {value: 'Starred', icon: 'star'},
    {value: 'Work', icon: 'work'},
    {value: 'Personal', icon: 'person'},
    {value: 'To Do', icon: 'checklist'},
    {value: 'Later', icon: 'schedule'},
    {value: 'Read', icon: 'menu_book'},
    {value: 'Travel', icon: 'flight'},
  ];

  selectedStates = signal<string[]>([]);

  constructor() {
    // Updates the display value when the listbox values change.
    afterRenderEffect(() => {
      const values = this.selectedStates();
      if (values.length === 0) {
        this.displayValue.set('Select a label');
      } else if (values.length === 1) {
        this.displayValue.set(values[0]);
      } else {
        this.displayValue.set(`${values[0]} + ${values.length - 1} more`);
      }
    });

    // Scrolls to the active item when the active option changes.
    afterRenderEffect(() => {
      const option = this.optionsList().find(opt => opt.active());
      if (option) {
        setTimeout(() => option.element.scrollIntoView({block: 'nearest'}), 50);
      }
    });
  }

  onCommit() {
    const values = this.selectedStates();
    if (values.length > 0) {
      this.displayValue.set(values[0]);
      this.popupExpanded.set(false);
    }
  }
}
