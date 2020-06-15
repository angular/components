/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef, Input} from '@angular/core';

@Directive({
  selector: '[cdkOption]',
  exportAs: 'cdkOption',
  host: {
    role: 'option',
    '[attr.aria-selected]': '_selected'
  }
})
export class CdkOption {
  private _selected: boolean | null = null;

  @Input()
  get selected(): boolean | null {
    return this._selected;
  }
  set selected(value: boolean | null) {
    this._selected = value;
  }

  constructor(private el: ElementRef) {
  }
}

@Directive({
    selector: '[cdkListbox]',
    exportAs: 'cdkListbox',
    host: {
        role: 'listbox',
    }
})
export class CdkListbox {

}
