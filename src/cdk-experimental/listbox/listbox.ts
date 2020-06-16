/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ContentChildren, Directive, ElementRef, HostListener, Input, QueryList} from '@angular/core';

@Directive({
  selector: '[cdkOption]',
  exportAs: 'cdkOption',
  host: {
    role: 'option',
    '[attr.aria-selected]': '_selected',
    '[attr.data-optionid]': '_optionId'
  }
})
export class CdkOption {
  private _selected: boolean | null = null;
  private _optionId: string;

  @Input()
  get selected(): boolean | null {
    return this._selected;
  }
  set selected(value: boolean | null) {
    this._selected = value;
  }

  constructor(private el: ElementRef) {
  }

  setOptionId(id: string): void {
    this._optionId = id;
  }

  getOptionId(): string {
    return this._optionId;
  }

  getElementRef(): ElementRef {
    return this.el;
  }
}

let _uniqueIdCounter = 0;

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

  @ContentChildren(CdkOption) _options: QueryList<CdkOption>;

  @HostListener('click', ['$event']) onClickUpdateSelectedOption($event: MouseEvent) {
    this._options.toArray().forEach(option => {
      if ($event.target instanceof Element) {
        if (option.getOptionId() === $event.target?.getAttribute('data-optionid')) {
          const selectedOption = option;
          this.updateSelectedOption(selectedOption);
        }
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

  selectOption(option: CdkOption): void {
    option.selected = true;
  }

  deselectOption(option: CdkOption): void {
    option.selected = null;
  }

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
