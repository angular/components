/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ContentChildren, Directive, ElementRef, Input, QueryList} from '@angular/core';
import {ActiveDescendantKeyManager, Highlightable, ListKeyManagerOption} from "@angular/cdk/a11y";

@Directive({
  selector: '[cdkOption]',
  exportAs: 'cdkOption',
  host: {
    role: 'option',
    '[attr.aria-selected]': '_selected',
    '[attr.data-optionid]': '_optionId'
  }
})
export class CdkOption implements ListKeyManagerOption, Highlightable {
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

  getLabel(): string {
      return this.el.nativeElement.textContent;
  }

  setOptionId(id: string): void {
    this._optionId = id;
  }

  setActiveStyles() {
  }

  setInactiveStyles() {
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
  _listKeyManager: ActiveDescendantKeyManager<CdkOption>;

  constructor(private el: ElementRef) {
  }

  @ContentChildren(CdkOption) _options: QueryList<CdkOption>;

  ngAfterContentInit() {
      this._options.forEach(option => {
          option.setOptionId(`cdk-option-${_uniqueIdCounter++}`);
      });

      this._listKeyManager = new ActiveDescendantKeyManager(this._options)
          .withWrap().withVerticalOrientation(true).withTypeAhead();
  }
}
