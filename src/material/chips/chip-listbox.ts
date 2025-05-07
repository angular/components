/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TAB} from '@angular/cdk/keycodes';
import {
  AfterContentInit,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  EventEmitter,
  forwardRef,
  inject,
  Input,
  OnDestroy,
  Output,
  QueryList,
  ViewEncapsulation,
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {Observable} from 'rxjs';
import {startWith, takeUntil} from 'rxjs/operators';
import {MatChip, MatChipEvent} from './chip';
import {MatChipAction} from './chip-action';
import {MatChipOption, MatChipSelectionChange} from './chip-option';
import {MatChipSet} from './chip-set';
import {MAT_CHIPS_DEFAULT_OPTIONS} from './tokens';

/** Change event object that is emitted when the chip listbox value has changed. */
export class MatChipListboxChange {
  constructor(
    /** Chip listbox that emitted the event. */
    public source: MatChipListbox,
    /** Value of the chip listbox when the event was emitted. */
    public value: any,
  ) {}
}

/**
 * Provider Expression that allows mat-chip-listbox to register as a ControlValueAccessor.
 * This allows it to support [(ngModel)].
 * @nodoc
 */
export const MAT_CHIP_LISTBOX_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MatChipListbox),
  multi: true,
};

/**
 * An extension of the MatChipSet component that supports chip selection.
 * Used with MatChipOption chips.
 */
@Component({
  selector: 'mat-chip-listbox',
  template: `
    <div class="mdc-evolution-chip-set__chips" role="presentation">
      <ng-content></ng-content>
    </div>
  `,
  styleUrl: 'chip-set.css',
  host: {
    'class': 'mdc-evolution-chip-set mat-mdc-chip-listbox',
    '[attr.role]': 'role',
    '[tabIndex]': '(disabled || empty) ? -1 : tabIndex',
    '[attr.aria-required]': 'role ? required : null',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.aria-multiselectable]': 'multiple',
    '[attr.aria-orientation]': 'ariaOrientation',
    '[class.mat-mdc-chip-list-disabled]': 'disabled',
    '[class.mat-mdc-chip-list-required]': 'required',
    '(focus)': 'focus()',
    '(blur)': '_blur()',
    '(keydown)': '_keydown($event)',
  },
  providers: [MAT_CHIP_LISTBOX_CONTROL_VALUE_ACCESSOR],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatChipListbox
  extends MatChipSet
  implements AfterContentInit, OnDestroy, ControlValueAccessor
{
  /**
   * Function when touched. Set as part of ControlValueAccessor implementation.
   * @nodoc
   */
  _onTouched = () => {};

  /**
   * Function when changed. Set as part of ControlValueAccessor implementation.
   * @nodoc
   */
  _onChange: (value: any) => void = () => {};

  // TODO: MDC uses `grid` here
  protected override _defaultRole = 'listbox';

  /** Default chip options. */
  private _defaultOptions = inject(MAT_CHIPS_DEFAULT_OPTIONS, {optional: true});

  /** Whether the user should be allowed to select multiple chips. */
  @Input({transform: booleanAttribute})
  get multiple(): boolean {
    return this._multiple;
  }
  set multiple(value: boolean) {
    this._multiple = value;
    this._syncListboxProperties();
  }
  private _multiple: boolean = false;

  /** The array of selected chips inside the chip listbox. */
  get selected(): MatChipOption[] | MatChipOption {
    const selectedChips = this._chips.toArray().filter(chip => chip.selected);
    return this.multiple ? selectedChips : selectedChips[0];
  }

  /** Orientation of the chip list. */
  @Input('aria-orientation') ariaOrientation: 'horizontal' | 'vertical' = 'horizontal';

  /**
   * Whether or not this chip listbox is selectable.
   *
   * When a chip listbox is not selectable, the selected states for all
   * the chips inside the chip listbox are always ignored.
   */
  @Input({transform: booleanAttribute})
  get selectable(): boolean {
    return this._selectable;
  }
  set selectable(value: boolean) {
    this._selectable = value;
    this._syncListboxProperties();
  }
  protected _selectable: boolean = true;

  /**
   * A function to compare the option values with the selected values. The first argument
   * is a value from an option. The second is a value from the selection. A boolean
   * should be returned.
   */
  @Input() compareWith: (o1: any, o2: any) => boolean = (o1: any, o2: any) => o1 === o2;

  /** Whether this chip listbox is required. */
  @Input({transform: booleanAttribute})
  required: boolean = false;

  /** Whether checkmark indicator for single-selection options is hidden. */
  @Input({transform: booleanAttribute})
  get hideSingleSelectionIndicator(): boolean {
    return this._hideSingleSelectionIndicator;
  }
  set hideSingleSelectionIndicator(value: boolean) {
    this._hideSingleSelectionIndicator = value;
    this._syncListboxProperties();
  }
  private _hideSingleSelectionIndicator: boolean =
    this._defaultOptions?.hideSingleSelectionIndicator ?? false;

  /** Combined stream of all of the child chips' selection change events. */
  get chipSelectionChanges(): Observable<MatChipSelectionChange> {
    return this._getChipStream<MatChipSelectionChange, MatChipOption>(chip => chip.selectionChange);
  }

  /** Combined stream of all of the child chips' blur events. */
  get chipBlurChanges(): Observable<MatChipEvent> {
    return this._getChipStream(chip => chip._onBlur);
  }

  /** The value of the listbox, which is the combined value of the selected chips. */
  @Input()
  get value(): any {
    return this._value;
  }
  set value(value: any) {
    if (this._chips && this._chips.length) {
      this._setSelectionByValue(value, false);
    }
    this._value = value;
  }
  protected _value: any;

  /** Event emitted when the selected chip listbox value has been changed by the user. */
  @Output() readonly change: EventEmitter<MatChipListboxChange> =
    new EventEmitter<MatChipListboxChange>();

  @ContentChildren(MatChipOption, {
    // We need to use `descendants: true`, because Ivy will no longer match
    // indirect descendants if it's left as false.
    descendants: true,
  })
  // We need an initializer here to avoid a TS error. The value will be set in `ngAfterViewInit`.
  override _chips: QueryList<MatChipOption> = undefined!;

  ngAfterContentInit() {
    this._chips.changes.pipe(startWith(null), takeUntil(this._destroyed)).subscribe(() => {
      if (this.value !== undefined) {
        Promise.resolve().then(() => {
          this._setSelectionByValue(this.value, false);
        });
      }
      // Update listbox selectable/multiple properties on chips
      this._syncListboxProperties();
    });

    this.chipBlurChanges.pipe(takeUntil(this._destroyed)).subscribe(() => this._blur());
    this.chipSelectionChanges.pipe(takeUntil(this._destroyed)).subscribe(event => {
      if (!this.multiple) {
        this._chips.forEach(chip => {
          if (chip !== event.source) {
            chip._setSelectedState(false, false, false);
          }
        });
      }

      if (event.isUserInput) {
        this._propagateChanges();
      }
    });
  }

  /**
   * Focuses the first selected chip in this chip listbox, or the first non-disabled chip when there
   * are no selected chips.
   */
  override focus(): void {
    if (this.disabled) {
      return;
    }

    const firstSelectedChip = this._getFirstSelectedChip();

    if (firstSelectedChip && !firstSelectedChip.disabled) {
      firstSelectedChip.focus();
    } else if (this._chips.length > 0) {
      this._keyManager.setFirstItemActive();
    } else {
      this._elementRef.nativeElement.focus();
    }
  }

  /**
   * Implemented as part of ControlValueAccessor.
   * @nodoc
   */
  writeValue(value: any): void {
    if (value != null) {
      this.value = value;
    } else {
      this.value = undefined;
    }
  }

  /**
   * Implemented as part of ControlValueAccessor.
   * @nodoc
   */
  registerOnChange(fn: (value: any) => void): void {
    this._onChange = fn;
  }

  /**
   * Implemented as part of ControlValueAccessor.
   * @nodoc
   */
  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  /**
   * Implemented as part of ControlValueAccessor.
   * @nodoc
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  /** Selects all chips with value. */
  _setSelectionByValue(value: any, isUserInput: boolean = true) {
    this._clearSelection();

    if (Array.isArray(value)) {
      value.forEach(currentValue => this._selectValue(currentValue, isUserInput));
    } else {
      this._selectValue(value, isUserInput);
    }
  }

  /** When blurred, marks the field as touched when focus moved outside the chip listbox. */
  _blur() {
    if (!this.disabled) {
      // Wait to see if focus moves to an individual chip.
      setTimeout(() => {
        if (!this.focused) {
          this._markAsTouched();
        }
      });
    }
  }

  _keydown(event: KeyboardEvent) {
    if (event.keyCode === TAB) {
      super._allowFocusEscape();
    }
  }

  /** Marks the field as touched */
  private _markAsTouched() {
    this._onTouched();
    this._changeDetectorRef.markForCheck();
  }

  /** Emits change event to set the model value. */
  private _propagateChanges(): void {
    let valueToEmit: any = null;

    if (Array.isArray(this.selected)) {
      valueToEmit = this.selected.map(chip => chip.value);
    } else {
      valueToEmit = this.selected ? this.selected.value : undefined;
    }
    this._value = valueToEmit;
    this.change.emit(new MatChipListboxChange(this, valueToEmit));
    this._onChange(valueToEmit);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Deselects every chip in the listbox.
   * @param skip Chip that should not be deselected.
   */
  private _clearSelection(skip?: MatChip): void {
    this._chips.forEach(chip => {
      if (chip !== skip) {
        chip.deselect();
      }
    });
  }

  /**
   * Finds and selects the chip based on its value.
   * @returns Chip that has the corresponding value.
   */
  private _selectValue(value: any, isUserInput: boolean): MatChip | undefined {
    const correspondingChip = this._chips.find(chip => {
      return chip.value != null && this.compareWith(chip.value, value);
    });

    if (correspondingChip) {
      isUserInput ? correspondingChip.selectViaInteraction() : correspondingChip.select();
    }

    return correspondingChip;
  }

  /** Syncs the chip-listbox selection state with the individual chips. */
  private _syncListboxProperties() {
    if (this._chips) {
      // Defer setting the value in order to avoid the "Expression
      // has changed after it was checked" errors from Angular.
      Promise.resolve().then(() => {
        this._chips.forEach(chip => {
          chip._chipListMultiple = this.multiple;
          chip.chipListSelectable = this._selectable;
          chip._chipListHideSingleSelectionIndicator = this.hideSingleSelectionIndicator;
          chip._changeDetectorRef.markForCheck();
        });
      });
    }
  }

  /** Returns the first selected chip in this listbox, or undefined if no chips are selected. */
  private _getFirstSelectedChip(): MatChipOption | undefined {
    if (Array.isArray(this.selected)) {
      return this.selected.length ? this.selected[0] : undefined;
    } else {
      return this.selected;
    }
  }

  /**
   * Determines if key manager should avoid putting a given chip action in the tab index. Skip
   * non-interactive actions since the user can't do anything with them.
   */
  protected override _skipPredicate(action: MatChipAction): boolean {
    // Override the skip predicate in the base class to avoid skipping disabled chips. Allow
    // disabled chip options to receive focus to align with WAI ARIA recommendation. Normally WAI
    // ARIA's instructions are to exclude disabled items from the tab order, but it makes a few
    // exceptions for compound widgets.
    //
    // From [Developing a Keyboard Interface](
    // https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/):
    //   "For the following composite widget elements, keep them focusable when disabled: Options in a
    //   Listbox..."
    return !action.isInteractive;
  }
}
