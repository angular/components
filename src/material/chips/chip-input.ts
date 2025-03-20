/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {BACKSPACE, hasModifierKey} from '@angular/cdk/keycodes';
import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  booleanAttribute,
  inject,
} from '@angular/core';
import {_IdGenerator} from '@angular/cdk/a11y';
import {MatFormField, MAT_FORM_FIELD} from '../form-field';
import {MatChipsDefaultOptions, MAT_CHIPS_DEFAULT_OPTIONS} from './tokens';
import {MatChipGrid} from './chip-grid';
import {MatChipTextControl} from './chip-text-control';

/** Represents an input event on a `matChipInput`. */
export interface MatChipInputEvent {
  /**
   * The native `<input>` element that the event is being fired for.
   * @deprecated Use `MatChipInputEvent#chipInput.inputElement` instead.
   * @breaking-change 13.0.0 This property will be removed.
   */
  input: HTMLInputElement;

  /** The value of the input. */
  value: string;

  /** Reference to the chip input that emitted the event. */
  chipInput: MatChipInput;
}

/**
 * Directive that adds chip-specific behaviors to an input element inside `<mat-form-field>`.
 * May be placed inside or outside of a `<mat-chip-grid>`.
 */
@Directive({
  selector: 'input[matChipInputFor]',
  exportAs: 'matChipInput, matChipInputFor',
  host: {
    // TODO: eventually we should remove `mat-input-element` from here since it comes from the
    // non-MDC version of the input. It's currently being kept for backwards compatibility, because
    // the MDC chips were landed initially with it.
    'class': 'mat-mdc-chip-input mat-mdc-input-element mdc-text-field__input mat-input-element',
    '(keydown)': '_keydown($event)',
    '(blur)': '_blur()',
    '(focus)': '_focus()',
    '(input)': '_onInput()',
    '[id]': 'id',
    '[attr.disabled]': 'disabled && !disabledInteractive ? "" : null',
    '[attr.placeholder]': 'placeholder || null',
    '[attr.aria-invalid]': '_chipGrid && _chipGrid.ngControl ? _chipGrid.ngControl.invalid : null',
    '[attr.aria-required]': '_chipGrid && _chipGrid.required || null',
    '[attr.aria-disabled]': 'disabled && disabledInteractive ? "true" : null',
    '[attr.readonly]': '_getReadonlyAttribute()',
    '[attr.required]': '_chipGrid && _chipGrid.required || null',
  },
})
export class MatChipInput implements MatChipTextControl, OnChanges, OnDestroy {
  protected _elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);

  /** Whether the control is focused. */
  focused: boolean = false;

  /** Register input for chip list */
  @Input('matChipInputFor')
  get chipGrid(): MatChipGrid {
    return this._chipGrid;
  }
  set chipGrid(value: MatChipGrid) {
    if (value) {
      this._chipGrid = value;
      this._chipGrid.registerInput(this);
    }
  }
  protected _chipGrid: MatChipGrid;

  /**
   * Whether or not the chipEnd event will be emitted when the input is blurred.
   */
  @Input({alias: 'matChipInputAddOnBlur', transform: booleanAttribute})
  addOnBlur: boolean = false;

  /**
   * The list of key codes that will trigger a chipEnd event.
   *
   * Defaults to `[ENTER]`.
   */
  @Input('matChipInputSeparatorKeyCodes')
  separatorKeyCodes: readonly number[] | ReadonlySet<number>;

  /** Emitted when a chip is to be added. */
  @Output('matChipInputTokenEnd')
  readonly chipEnd: EventEmitter<MatChipInputEvent> = new EventEmitter<MatChipInputEvent>();

  /** The input's placeholder text. */
  @Input() placeholder: string = '';

  /** Unique id for the input. */
  @Input() id: string = inject(_IdGenerator).getId('mat-mdc-chip-list-input-');

  /** Whether the input is disabled. */
  @Input({transform: booleanAttribute})
  get disabled(): boolean {
    return this._disabled || (this._chipGrid && this._chipGrid.disabled);
  }
  set disabled(value: boolean) {
    this._disabled = value;
  }
  private _disabled: boolean = false;

  /** Whether the input is readonly. */
  @Input({transform: booleanAttribute})
  readonly: boolean = false;

  /** Whether the input should remain interactive when it is disabled. */
  @Input({alias: 'matChipInputDisabledInteractive', transform: booleanAttribute})
  disabledInteractive: boolean;

  /** Whether the input is empty. */
  get empty(): boolean {
    return !this.inputElement.value;
  }

  /** The native input element to which this directive is attached. */
  readonly inputElement!: HTMLInputElement;

  constructor(...args: unknown[]);

  constructor() {
    const defaultOptions = inject<MatChipsDefaultOptions>(MAT_CHIPS_DEFAULT_OPTIONS);
    const formField = inject<MatFormField>(MAT_FORM_FIELD, {optional: true});

    this.inputElement = this._elementRef.nativeElement as HTMLInputElement;
    this.separatorKeyCodes = defaultOptions.separatorKeyCodes;
    this.disabledInteractive = defaultOptions.inputDisabledInteractive ?? false;

    if (formField) {
      this.inputElement.classList.add('mat-mdc-form-field-input-control');
    }
  }

  ngOnChanges() {
    this._chipGrid.stateChanges.next();
  }

  ngOnDestroy(): void {
    this.chipEnd.complete();
  }

  /** Utility method to make host definition/tests more clear. */
  _keydown(event: KeyboardEvent) {
    if (this.empty && event.keyCode === BACKSPACE) {
      // Ignore events where the user is holding down backspace
      // so that we don't accidentally remove too many chips.
      if (!event.repeat) {
        this._chipGrid._focusLastChip();
      }
      event.preventDefault();
    } else {
      this._emitChipEnd(event);
    }
  }

  /** Checks to see if the blur should emit the (chipEnd) event. */
  _blur() {
    if (this.addOnBlur) {
      this._emitChipEnd();
    }
    this.focused = false;
    // Blur the chip list if it is not focused
    if (!this._chipGrid.focused) {
      this._chipGrid._blur();
    }
    this._chipGrid.stateChanges.next();
  }

  _focus() {
    this.focused = true;
    this._chipGrid.stateChanges.next();
  }

  /** Checks to see if the (chipEnd) event needs to be emitted. */
  _emitChipEnd(event?: KeyboardEvent) {
    if (!event || (this._isSeparatorKey(event) && !event.repeat)) {
      this.chipEnd.emit({
        input: this.inputElement,
        value: this.inputElement.value,
        chipInput: this,
      });

      event?.preventDefault();
    }
  }

  _onInput() {
    // Let chip list know whenever the value changes.
    this._chipGrid.stateChanges.next();
  }

  /** Focuses the input. */
  focus(): void {
    this.inputElement.focus();
  }

  /** Clears the input */
  clear(): void {
    this.inputElement.value = '';
  }

  setDescribedByIds(ids: string[]): void {
    const element = this._elementRef.nativeElement;

    // Set the value directly in the DOM since this binding
    // is prone to "changed after checked" errors.
    if (ids.length) {
      element.setAttribute('aria-describedby', ids.join(' '));
    } else {
      element.removeAttribute('aria-describedby');
    }
  }

  /** Checks whether a keycode is one of the configured separators. */
  private _isSeparatorKey(event: KeyboardEvent) {
    return !hasModifierKey(event) && new Set(this.separatorKeyCodes).has(event.keyCode);
  }

  /** Gets the value to set on the `readonly` attribute. */
  protected _getReadonlyAttribute(): string | null {
    return this.readonly || (this.disabled && this.disabledInteractive) ? 'true' : null;
  }
}
