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
  HostListener,
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
    '[attr.aria-selected]': '_selected',
    '[attr.data-optionid]': '_optionId',
  }
})
export class CdkOption {
  private _selected: boolean | null = null;
  private _optionId: string;

  /** Whether the option is selected or not */
  @Input()
  get selected(): boolean | null {
    return this._selected;
  }
  set selected(value: boolean | null) {
    this._selected = value;
  }

  constructor(private el: ElementRef) {
  }

  /** Sets the optionId to the given id */
  setOptionId(id: string): void {
    this._optionId = id;
  }

  /** Returns the optionId of this option */
  getOptionId(): string {
    return this._optionId;
  }

  /** Returns an ElementRef of this option */
  getElementRef(): ElementRef {
    return this.el;
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
  }
})
export class CdkListbox {

  constructor(private el: ElementRef) {
  }

  /** A query list containing all CdkOption elements within this listbox */
  @ContentChildren(CdkOption) _options: QueryList<CdkOption>;

  /** Listener activated on click of this listbox */
  @HostListener('click', ['$event']) onClickUpdateSelectedOption($event: MouseEvent) {
    console.log('in listbox click event');
    console.log($event.target);
    this._options.toArray().forEach(option => {
      const optionId = option.getOptionId();
      if ($event.target instanceof Element && optionId === $event.target?.getAttribute('data-optionid')) {
        this.updateSelectedOption(option);
      }
    });
  }

  ngAfterContentInit() {
    this._options.forEach(option => {
      option.setOptionId(`cdk-option-${_uniqueIdCounter++}`);
    });
  }

  private updateSelectedOption(option: CdkOption): void {
    if (option.selected) {
      this.deselectOption(option);
    } else {
      this.selectOption(option);
    }
  }

  /** Sets the given option's selected state to true */
  selectOption(option: CdkOption): void {
    option.selected = true;
  }

  /** Sets the given option's selected state to null. Null is preferable to false for screen readers */
  deselectOption(option: CdkOption): void {
    option.selected = null;
  }

  /** Returns an array of all options that are currently selected */
  getSelectedOptions(): Array<CdkOption> {
    const selectedOptions = new Array<CdkOption>();
    this._options.toArray().forEach(option => {
      if (option.selected) {
        selectedOptions.push(option);
      }
    });

    return selectedOptions;
  }
}
