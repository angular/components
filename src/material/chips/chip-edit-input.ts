/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef, inject} from '@angular/core';
import {DOCUMENT} from '@angular/common';

/**
 * A directive that makes a span editable and exposes functions to modify and retrieve the
 * element's contents.
 */
@Directive({
  selector: 'span[matChipEditInput]',
  host: {
    'class': 'mat-chip-edit-input',
    'role': 'textbox',
    'tabindex': '-1',
    'contenteditable': 'true',
  },
  standalone: true,
})
export class MatChipEditInput {
  private readonly _elementRef = inject(ElementRef);
  private readonly _document = inject(DOCUMENT);

  constructor(...args: unknown[]);
  constructor() {}

  initialize(initialValue: string) {
    this.getNativeElement().focus();
    this.setValue(initialValue);
  }

  getNativeElement(): HTMLElement {
    return this._elementRef.nativeElement;
  }

  setValue(value: string) {
    this.getNativeElement().textContent = value;
    this._moveCursorToEndOfInput();
  }

  getValue(): string {
    return this.getNativeElement().textContent || '';
  }

  private _moveCursorToEndOfInput() {
    const range = this._document.createRange();
    range.selectNodeContents(this.getNativeElement());
    range.collapse(false);
    const sel = window.getSelection()!;
    sel.removeAllRanges();
    sel.addRange(range);
  }
}
