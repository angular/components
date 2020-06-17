/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BACKSPACE, DELETE} from '@angular/cdk/keycodes';
import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {MatChip} from './chip';
import {MatChipEditInput} from './chip-edit-input';
import {GridKeyManagerRow} from './grid-key-manager';


/**
 * An extension of the MatChip component used with MatChipGrid and
 * the matChipInputFor directive.
 */
@Component({
  selector: 'mat-chip-row, mat-basic-chip-row',
  templateUrl: 'chip-row.html',
  styleUrls: ['chips.css'],
  inputs: ['color', 'disableRipple', 'tabIndex'],
  host: {
    'role': 'row',
    '[class.mat-mdc-chip-disabled]': 'disabled',
    '[class.mat-mdc-chip-highlighted]': 'highlighted',
    '[class.mat-mdc-chip-with-avatar]': 'leadingIcon',
    '[class.mat-mdc-chip-with-trailing-icon]': 'trailingIcon || removeIcon',
    '[class.mdc-chip--editable]': 'editable',
    '[id]': 'id',
    '[attr.disabled]': 'disabled || null',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[tabIndex]': 'tabIndex',
    '(mousedown)': '_mousedown($event)',
    '(dblclick)': '_dblclick($event)',
    '(keydown)': '_keydown($event)',
    '(focusin)': '_focusin($event)',
    '(focusout)': '_focusout($event)'
  },
  providers: [{provide: MatChip, useExisting: MatChipRow}],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatChipRow extends MatChip implements AfterContentInit, AfterViewInit,
  GridKeyManagerRow<HTMLElement> {
  protected basicChipAttrName = 'mat-basic-chip-row';

  /**
   * The focusable wrapper element in the first gridcell, which contains all
   * chip content other than the remove icon.
   */
  @ViewChild('chipContent') chipContent: ElementRef;

  /** The default chip edit input that is used if none is projected into this chip row. */
  @ViewChild(MatChipEditInput) defaultEditInput?: MatChipEditInput;

  /** The projected chip edit input. */
  @ContentChild(MatChipEditInput) contentEditInput?: MatChipEditInput;

  /**
   * Gets the projected chip edit input, or the default input if none is projected in. One of these
   * two values is guaranteed to be defined.
   */
  get editInput(): MatChipEditInput {
    return this.contentEditInput || this.defaultEditInput!;
  }

  /** The focusable grid cells for this row. Implemented as part of GridKeyManagerRow. */
  cells!: HTMLElement[];

  ngAfterContentInit() {
    super.ngAfterContentInit();

    if (this.removeIcon) {
      // Defer setting the value in order to avoid the "Expression
      // has changed after it was checked" errors from Angular.
      setTimeout(() => {
        // removeIcon has tabIndex 0 for regular chips, but should only be focusable by
        // the GridFocusKeyManager for row chips.
        this.removeIcon.tabIndex = -1;
      });
    }
  }

  ngAfterViewInit() {
    super.ngAfterViewInit();
    this.cells = this.removeIcon ?
      [this.chipContent.nativeElement, this.removeIcon._elementRef.nativeElement] :
      [this.chipContent.nativeElement];
  }

  /**
   * Allows for programmatic focusing of the chip.
   * Sends focus to the first grid cell. The row chip element itself
   * is never focused.
   */
  focus(): void {
    if (this.disabled) {
      return;
    }

    if (!this._hasFocusInternal) {
      this._onFocus.next({chip: this});
    }

    this.chipContent.nativeElement.focus();
  }

  /**
   * Emits a blur event when one of the gridcells loses focus, unless focus moved
   * to the other gridcell.
   */
  _focusout(event: FocusEvent) {
    this._hasFocusInternal = false;
    // Wait to see if focus moves to the other gridcell
    setTimeout(() => {
      if (this._hasFocus) {
        return;
      }
      this._onBlur.next({chip: this});
      this._handleInteraction(event);
    });
  }

  /** Records that the chip has focus when one of the gridcells is focused. */
  _focusin(event: FocusEvent) {
    this._hasFocusInternal = true;
    this._handleInteraction(event);
  }

  /** Sends focus to the first gridcell when the user clicks anywhere inside the chip. */
  _mousedown(event: MouseEvent) {
    if (this._isEditing()) {
      return;
    }

    if (!this.disabled) {
      this.focus();
    }

    event.preventDefault();
  }

  _dblclick(event: MouseEvent) {
    this._handleInteraction(event);
  }

  /** Handles custom key presses. */
  _keydown(event: KeyboardEvent): void {
    if (this.disabled) {
      return;
    }
    if (this._isEditing()) {
      this._handleInteraction(event);
      return;
    }
    switch (event.keyCode) {
      case DELETE:
      case BACKSPACE:
        // Remove the focused chip
        this.remove();
        // Always prevent so page navigation does not occur
        event.preventDefault();
        break;
      default:
        this._handleInteraction(event);
    }
  }

  protected _onEditStart() {
    // Defer initializing the input so it has time to be added to the DOM.
    setTimeout(() => {
      this.editInput.initialize(this.value);
    });
  }

  protected _onEditFinish() {
    // If the edit input is still focused or focus was returned to the body after it was destroyed,
    // return focus to the chip contents.
    if (document.activeElement === this.editInput.getNativeElement() ||
        document.activeElement === document.body) {
      this.chipContent.nativeElement.focus();
    }
    this.edited.emit({chip: this, value: this.editInput.getValue()});
  }
}
