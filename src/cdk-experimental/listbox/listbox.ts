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
  ElementRef, EventEmitter, forwardRef, Inject,
  Input, Output,
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
    '(click)': 'toggle()',
    '[attr.aria-selected]': '_selected || null',
    '[attr.data-optionid]': '_optionId',
  }
})
export class CdkOption {
  private _selected: boolean = false;
  private _optionId: string;

  /** Whether the option is selected or not */
  @Input()
  get selected(): boolean {
    return this._selected;
  }
  set selected(value: boolean) {
    this._selected = value;
  }

  constructor(private readonly _elementRef: ElementRef,
              @Inject(forwardRef(() => CdkListbox)) public listbox: CdkListbox) {
    this.setOptionId(`cdk-option-${_uniqueIdCounter++}`);
  }

  toggle() {
    this.selected = !this.selected;
    this.listbox._emitChangeEvent(this);
  }

  /** Sets the optionId to the given id */
  setOptionId(id: string) {
    this._optionId = id;
  }

  /** Returns the optionId of this option */
  getOptionId(): string {
    return this._optionId;
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

  /** A query list containing all CdkOption elements within this listbox */
  @ContentChildren(CdkOption, {descendants: true}) _options: QueryList<CdkOption>;

  @Output() readonly selectionChange: EventEmitter<CdkOption> = new EventEmitter<CdkOption>();

  /** Emits a selection change event, called when an option has its selected state changed */
  _emitChangeEvent(option: CdkOption) {
    this.selectionChange.emit(option);
  }

  /** Sets the given option's selected state to true */
  select(option: CdkOption) {
    option.selected = true;
  }

  /** Sets the given option's selected state to null. Null is preferable for screen readers */
  deselect(option: CdkOption) {
    option.selected = false;
  }
}
