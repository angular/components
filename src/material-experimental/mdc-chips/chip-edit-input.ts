/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Directive,
  ElementRef,
} from '@angular/core';

/**
 * A directive that makes a span editable and exposes functions to modify and retrieve the
 * element's contents.
 */
@Directive({
  selector: 'span[matChipEditInput]',
  host: {
    'class': 'mdc-chip__primary-action mat-chip-edit-input',
    'role': 'textbox',
    'tabindex': '-1',
    'contenteditable': 'true',
  },
})
export class MatChipEditInput {
  constructor(
      private readonly _elementRef: ElementRef,
  ) {}

  initialize(initialValue: string) {
    this.getNativeElement().focus();
    this.setValue(initialValue);
  }

  getNativeElement(): HTMLElement {
    return this._elementRef.nativeElement;
  }

  setValue(value: string) {
    this.getNativeElement().innerText = value;
    this._moveCursorToEndOfInput();
  }

  getValue(): string {
    return this.getNativeElement().textContent || '';
  }

  private _moveCursorToEndOfInput() {
    const range = document.createRange();
    range.selectNodeContents(this.getNativeElement());
    range.collapse(false);
    const sel = window.getSelection()!;
    sel.removeAllRanges();
    sel.addRange(range);
  }
}
