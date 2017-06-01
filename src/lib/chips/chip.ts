/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  Renderer2,
} from '@angular/core';

import {Observable} from 'rxjs/Observable';
import {Focusable} from '../core/a11y/focus-key-manager';
import {coerceBooleanProperty} from '@angular/cdk';
import {CanColor, mixinColor} from '../core/common-behaviors/color';
import {CanDisable, mixinDisabled} from '../core/common-behaviors/disabled';
import {SPACE, BACKSPACE, DELETE} from '../core/keyboard/keycodes';

export interface MdChipEvent {
  chip: MdChip;
}

// Boilerplate for applying mixins to MdChip.
/** @docs-private */
export class MdChipBase {
  constructor(public _renderer: Renderer2, public _elementRef: ElementRef) {}
}
export const _MdChipMixinBase = mixinColor(mixinDisabled(MdChipBase), 'primary');


/**
 * Dummy directive to add CSS class to basic chips.
 * @docs-private
 */
@Directive({
  selector: `md-basic-chip, [md-basic-chip], mat-basic-chip, [mat-basic-chip]`,
  host: {'class': 'mat-basic-chip'}
})
export class MdBasicChip { }

/**
 * Material design styled Chip component. Used inside the MdChipList component.
 */
@Directive({
  selector: `md-basic-chip, [md-basic-chip], md-chip, [md-chip],
             mat-basic-chip, [mat-basic-chip], mat-chip, [mat-chip]`,
  inputs: ['color'],
  host: {
    'class': 'mat-chip',
    'tabindex': '-1',
    'role': 'option',
    '[class.mat-chip-selected]': 'selected',
    '[class.mat-chip-has-remove-icon]': '_hasRemoveIcon',
    '[attr.disabled]': 'disabled || null',
    '[attr.aria-disabled]': 'disabled.toString()',
    '(click)': '_handleClick($event)',
    '(keydown)': '_handleKeydown($event)'
  }
})
export class MdChip extends _MdChipMixinBase implements Focusable, OnDestroy, CanColor, CanDisable {

  /** Whether the chip is selected. */
  @Input() get selected(): boolean { return this._selected; }
  set selected(value: boolean) {
    this._selected = coerceBooleanProperty(value);
    (this.selected ? this.select : this.deselect).emit({chip: this});
  }

  /** Whether or not the chip is selectable. */
  protected _selectable: boolean = true;

  /** Whether or not the chip is removable. */
  protected _removable: boolean = true;

  /** Whether or not the chip is selected. */
  protected _selected: boolean = false;

  /** Whether the chip has focus. */
  _hasFocus: boolean = false;

  /** Whether or not the chip is displaying the remove icon. */
  _hasRemoveIcon: boolean = false;

  /** Emitted when the removable property changes. */
  private _onRemovableChange = new EventEmitter<boolean>();
  onRemovableChange: Observable<boolean> = this._onRemovableChange.asObservable();

  /** Emitted when the chip is focused. */
  onFocus = new EventEmitter<MdChipEvent>();

  /** Emitted when the chip is selected. */
  @Output() select = new EventEmitter<MdChipEvent>();

  /** Emitted when the chip is deselected. */
  @Output() deselect = new EventEmitter<MdChipEvent>();

  /** Emitted when the chip is destroyed. */
  @Output() destroy = new EventEmitter<MdChipEvent>();

  constructor(renderer: Renderer2, elementRef: ElementRef) {
    super(renderer, elementRef);

  /** Emitted when a chip is to be removed. */
  @Output('remove') onRemove = new EventEmitter<MdChipEvent>();

  ngOnInit(): void {
    this._addDefaultCSSClass();
    this._updateColor(this._color);
  }

  ngOnDestroy(): void {
    this.destroy.emit({chip: this});
  }

  /**
   * Toggles the current selected state of this chip.
   * @return Whether the chip is selected.
   */
  @Input() get disabled(): boolean {
    return this._disabled;
  }

  /** Sets the disabled state of the chip. */
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value) ? true : null;
  }

  /** A String representation of the current disabled state. */
  get _isAriaDisabled(): string {
    return String(coerceBooleanProperty(this.disabled));
  }

  /**
   * Whether or not the chips are selectable. When a chip is not selectable,
   * changes to it's selected state are always ignored.
   */
  @Input() get selectable(): boolean {
    return this._selectable;
  }

  set selectable(value: boolean) {
    this._selectable = coerceBooleanProperty(value);
  }

  /**
   * Determines whether or not the chip displays the remove styling and emits (remove) events.
   */
  @Input() get removable(): boolean {
    return this._removable;
  }

  set removable(value: boolean) {
    this._removable = coerceBooleanProperty(value);
    this._onRemovableChange.emit(this._removable);
  }

  /** Toggles the current selected state of this chip. */
  toggleSelected(): boolean {
    this.selected = !this.selected;
    return this.selected;
  }

  /** Allows for programmatic focusing of the chip. */
  focus(): void {
    this._elementRef.nativeElement.focus();
    this.onFocus.emit({chip: this});
  }

  /**
   * Allows for programmatic removal of the chip. Called by the MdChipList when the DELETE or
   * BACKSPACE keys are pressed.
   *
   * Note: This only informs any listeners of the removal request, it does **not** actually remove
   * the chip from the DOM.
   */
  remove(): void {
    if (this.removable) {
      this.onRemove.emit({chip: this});
    }
  }

  /** Ensures events fire properly upon click. */
  _handleClick(event: Event) {
    // Check disabled
    if (this._checkDisabled(event)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.focus();
  }

  /** Handle custom key presses. */
  _handleKeydown(event: KeyboardEvent) {
    if (this._checkDisabled(event)) {
      return;
    }

    switch (event.keyCode) {
      case DELETE:
      case BACKSPACE:
        // If we are removable, remove the focused chip
        if (this.removable) {
          this.onRemove.emit();
        }

        // Always prevent so page navigation does not occur
        event.preventDefault();
        break;
      case SPACE:
        // If we are selectable, toggle the focused chip
        if (this.selectable) {
          this.toggleSelected();
        }

        // Always prevent space from scrolling the page since the list has focus
        event.preventDefault();
        break;
    }
  }

  /**
   * Sets whether or not this chip is displaying a remove icon. Adds/removes the
   * `md-chip-has-remove-icon` class.
   */
  _setHasRemoveIcon(value: boolean) {
    this._hasRemoveIcon = value;
  }

  protected _checkDisabled(event: Event): boolean {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
    }

    return this.disabled;
  }
}
