/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef, Input} from '@angular/core';
import {ListKeyManagerOption} from "@angular/cdk/a11y";

@Directive({
  selector: '[cdkOption]',
  exportAs: 'cdkOption',
  host: {
    role: 'option',
    '[attr.aria-selected]': '_selected'
  }
})
export class CdkOption implements ListKeyManagerOption {
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

  getLabel(): string {
      return this.el.nativeElement.textContent;
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
