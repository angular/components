/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  InjectionToken,
  Input,
  OnDestroy,
  Optional,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';

export interface MatChipEditInputDestroyEvent {
  hadFocus: boolean;
}

export interface MatChipEditInputManager {
  setMatChipEditInput(value: MatChipEditInputInterface): void;
  clearMatChipEditInput(): void;
}

export const MAT_CHIP_EDIT_INPUT_MANAGER =
    new InjectionToken<MatChipEditInputManager>('MAT_CHIP_EDIT_INPUT_MANAGER');

export interface MatChipEditInputInterface {
  getNativeElement(): HTMLElement;
  setValue(value: string): void;
}

/**
 * A component that handles editing an existing chip and exposes itself to an optional injected
 * manager so parent components can extend the editing behavior.
 */
@Component({
  selector: 'mat-chip-edit-input',
  templateUrl: 'chip-edit-input.html',
  styleUrls: ['chips.css'],
  inputs: ['initialValue'],
  host: {
    '(input)': '_onInput($event)',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatChipEditInput implements AfterViewInit, OnDestroy, MatChipEditInputInterface {
  @Input() initialValue = '';

  @Output() readonly updated = new EventEmitter<string>();

  @Output() readonly destroyed = new EventEmitter<MatChipEditInputDestroyEvent>();

  @ViewChild('inputElement') inputElement!: ElementRef;

  constructor(
      @Optional() @Inject(MAT_CHIP_EDIT_INPUT_MANAGER)
      private readonly _inputManager: MatChipEditInputManager,
  ) {
    if (_inputManager) {
      _inputManager.setMatChipEditInput(this);
    }
  }

  ngAfterViewInit() {
    this.getNativeElement().innerText = this.initialValue;
    this.getNativeElement().focus();
    this._moveCursorToEndOfInput();
  }

  ngOnDestroy() {
    this.destroyed.emit({
      // We assume the input had focus if it is still the active element or the body
      // has become the active element on destroy.
      hadFocus: document.activeElement === this.getNativeElement() ||
                document.activeElement === document.body,
    });
    if (this._inputManager) {
      this._inputManager.clearMatChipEditInput();
    }
  }

  getNativeElement(): HTMLElement {
    return this.inputElement.nativeElement;
  }

  setValue(value: string) {
    this.getNativeElement().innerText = value;
    this._onInput();
  }

  _onInput() {
    this.updated.emit(
        this.getNativeElement().textContent!.trim());
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
