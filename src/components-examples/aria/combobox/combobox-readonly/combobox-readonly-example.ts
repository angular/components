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
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  signal,
  viewChild,
} from '@angular/core';
import {FormsModule} from '@angular/forms';

/** @title Readonly combobox. */
@Component({
  selector: 'combobox-readonly-example',
  templateUrl: 'combobox-readonly-example.html',
  styleUrl: '../combobox-examples.css',
  imports: [
    Combobox,
    ComboboxInput,
    ComboboxPopup,
    ComboboxPopupContainer,
    Listbox,
    Option,
    FormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComboboxReadonlyExample {
  popover = viewChild<ElementRef>('popover');
  listbox = viewChild<Listbox<any>>(Listbox);
  combobox = viewChild<Combobox<any>>(Combobox);

  options = () => states;
  searchString = signal('');

  constructor() {
    afterRenderEffect(() => {
      const popover = this.popover()!;
      const combobox = this.combobox()!;
      combobox.pattern.expanded() ? this.showPopover() : popover.nativeElement.hidePopover();

      // TODO(wagnermaciel): Make this easier for developers to do.
      this.listbox()?.pattern.inputs.activeItem()?.element().scrollIntoView({block: 'nearest'});
    });
  }

  showPopover() {
    const popover = this.popover()!;
    const combobox = this.combobox()!;

    const comboboxRect = combobox.pattern.inputs.inputEl()?.getBoundingClientRect();
    const popoverEl = popover.nativeElement;

    if (comboboxRect) {
      popoverEl.style.width = `${comboboxRect.width}px`;
      popoverEl.style.top = `${comboboxRect.bottom + 4}px`;
      popoverEl.style.left = `${comboboxRect.left - 1}px`;
    }

    popover.nativeElement.showPopover();
  }
}

const states = ['Option 1', 'Option 2', 'Option 3'];
