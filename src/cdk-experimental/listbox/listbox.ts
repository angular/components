/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ContentChildren,
  Directive,
  ElementRef,
  Input,
  QueryList
} from '@angular/core';

/**
 * Directive that applies interaction patterns to an element following the aria role of option.
 * Typically meant to be placed inside a listbox. Logic handling selection, disabled state, and
 * value is built in.
 */
@Directive({
  selector: '[cdkOption]',
  exportAs: 'cdkOption',
  host: {
    role: 'option',
    '[attr.aria-selected]': '_selected || null',
    '[attr.data-optionid]': '_optionId',
  }
})
export class CdkOption {
  private _selected: boolean;
  private _optionId: string;

  /** Whether the option is selected or not */
  @Input()
  get selected(): boolean {
    return this._selected;
  }
  set selected(value: boolean) {
    this._selected = value;
  }

  constructor(private readonly _elementRef: ElementRef) {
    this.setOptionId(`cdk-option-${_uniqueIdCounter++}`);
  }

  /** Sets the optionId to the given id */
  setOptionId(id: string) {
    this._optionId = id;
  }

  /** Returns the optionId of this option */
  getOptionId(): string {
    return this._optionId;
  }

  /** Returns an ElementRef of this option */
  getElementRef(): ElementRef {
    return this._elementRef;
  }
}

let _uniqueIdCounter = 0;

/**
 * Directive that applies interaction patterns to an element following the aria role of listbox.
 * Typically CdkOption elements are placed inside the listbox. Logic to handle keyboard navigation,
 * selection of options, active options, and disabled states is built in.
 */
@Directive({
  selector: '[cdkListbox]',
  exportAs: 'cdkListbox',
  host: {
    role: 'listbox',
    '(click)': 'onClickUpdateSelectedOption($event)'
  }
})
export class CdkListbox {

  /** A query list containing all CdkOption elements within this listbox */
  @ContentChildren(CdkOption, {descendants: true}) _options: QueryList<CdkOption>;

  /** On click handler of this listbox, updates selected value of clicked option */
  onClickUpdateSelectedOption(event: MouseEvent) {
    for (const option of this._options.toArray()) {
      const optionId = option.getOptionId();
      if (event.target instanceof Element &&
          optionId === event.target?.getAttribute('data-optionid')) {
        this._updateSelectedOption(option);
      }
    }
  }

  private _updateSelectedOption(option: CdkOption) {
    if (option.selected) {
      this.deselect(option);
    } else {
      this.select(option);
    }
  }

  /** Sets the given option's selected state to true */
  select(option: CdkOption) {
    option.selected = true;
  }

  /** Sets the given option's selected state to null. Null is preferable for screen readers */
  deselect(option: CdkOption) {
    option.selected = false;
  }

  /** Returns an array of all options that are currently selected */
  getSelectedOptions(): CdkOption[] {
    return this._options.toArray().filter(option => option.selected);
  }
}
