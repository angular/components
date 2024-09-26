/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOWN_ARROW, hasModifierKey, TAB, UP_ARROW} from '@angular/cdk/keycodes';
import {
  AfterContentInit,
  AfterViewInit,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  DoCheck,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  QueryList,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormGroupDirective,
  NgControl,
  NgForm,
  Validators,
} from '@angular/forms';
import {_ErrorStateTracker, ErrorStateMatcher} from '@angular/material/core';
import {MatFormFieldControl} from '@angular/material/form-field';
import {merge, Observable, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {MatChipEvent} from './chip';
import {MatChipRow} from './chip-row';
import {MatChipSet} from './chip-set';
import {MatChipTextControl} from './chip-text-control';

/** Change event object that is emitted when the chip grid value has changed. */
export class MatChipGridChange {
  constructor(
    /** Chip grid that emitted the event. */
    public source: MatChipGrid,
    /** Value of the chip grid when the event was emitted. */
    public value: any,
  ) {}
}

/**
 * An extension of the MatChipSet component used with MatChipRow chips and
 * the matChipInputFor directive.
 */
@Component({
  selector: 'mat-chip-grid',
  template: `
    <div class="mdc-evolution-chip-set__chips" role="presentation">
      <ng-content></ng-content>
    </div>
  `,
  styleUrl: 'chip-set.css',
  host: {
    'class': 'mat-mdc-chip-set mat-mdc-chip-grid mdc-evolution-chip-set',
    '[attr.role]': 'role',
    '[attr.tabindex]': '(disabled || (_chips && _chips.length === 0)) ? -1 : tabIndex',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.aria-invalid]': 'errorState',
    '[class.mat-mdc-chip-list-disabled]': 'disabled',
    '[class.mat-mdc-chip-list-invalid]': 'errorState',
    '[class.mat-mdc-chip-list-required]': 'required',
    '(focus)': 'focus()',
    '(blur)': '_blur()',
  },
  providers: [{provide: MatFormFieldControl, useExisting: MatChipGrid}],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class MatChipGrid
  extends MatChipSet
  implements
    AfterContentInit,
    AfterViewInit,
    ControlValueAccessor,
    DoCheck,
    MatFormFieldControl<any>,
    OnDestroy
{
  ngControl = inject(NgControl, {optional: true, self: true})!;

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  readonly controlType: string = 'mat-chip-grid';

  /** The chip input to add more chips */
  protected _chipInput: MatChipTextControl;

  protected override _defaultRole = 'grid';
  private _errorStateTracker: _ErrorStateTracker;

  /**
   * List of element ids to propagate to the chipInput's aria-describedby attribute.
   */
  private _ariaDescribedbyIds: string[] = [];

  /**
   * Function when touched. Set as part of ControlValueAccessor implementation.
   * @docs-private
   */
  _onTouched = () => {};

  /**
   * Function when changed. Set as part of ControlValueAccessor implementation.
   * @docs-private
   */
  _onChange: (value: any) => void = () => {};

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  @Input({transform: booleanAttribute})
  override get disabled(): boolean {
    return this.ngControl ? !!this.ngControl.disabled : this._disabled;
  }
  override set disabled(value: boolean) {
    this._disabled = value;
    this._syncChipsState();
  }

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  get id(): string {
    return this._chipInput.id;
  }

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  override get empty(): boolean {
    return (
      (!this._chipInput || this._chipInput.empty) && (!this._chips || this._chips.length === 0)
    );
  }

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  @Input()
  get placeholder(): string {
    return this._chipInput ? this._chipInput.placeholder : this._placeholder;
  }
  set placeholder(value: string) {
    this._placeholder = value;
    this.stateChanges.next();
  }
  protected _placeholder: string;

  /** Whether any chips or the matChipInput inside of this chip-grid has focus. */
  override get focused(): boolean {
    return this._chipInput.focused || this._hasFocusedChip();
  }

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  @Input({transform: booleanAttribute})
  get required(): boolean {
    return this._required ?? this.ngControl?.control?.hasValidator(Validators.required) ?? false;
  }
  set required(value: boolean) {
    this._required = value;
    this.stateChanges.next();
  }
  protected _required: boolean | undefined;

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  get shouldLabelFloat(): boolean {
    return !this.empty || this.focused;
  }

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  @Input()
  get value(): any {
    return this._value;
  }
  set value(value: any) {
    this._value = value;
  }
  protected _value: any[] = [];

  /** An object used to control when error messages are shown. */
  @Input()
  get errorStateMatcher() {
    return this._errorStateTracker.matcher;
  }
  set errorStateMatcher(value: ErrorStateMatcher) {
    this._errorStateTracker.matcher = value;
  }

  /** Combined stream of all of the child chips' blur events. */
  get chipBlurChanges(): Observable<MatChipEvent> {
    return this._getChipStream(chip => chip._onBlur);
  }

  /** Emits when the chip grid value has been changed by the user. */
  @Output() readonly change: EventEmitter<MatChipGridChange> =
    new EventEmitter<MatChipGridChange>();

  /**
   * Emits whenever the raw value of the chip-grid changes. This is here primarily
   * to facilitate the two-way binding for the `value` input.
   * @docs-private
   */
  @Output() readonly valueChange: EventEmitter<any> = new EventEmitter<any>();

  @ContentChildren(MatChipRow, {
    // We need to use `descendants: true`, because Ivy will no longer match
    // indirect descendants if it's left as false.
    descendants: true,
  })
  // We need an initializer here to avoid a TS error. The value will be set in `ngAfterViewInit`.
  override _chips: QueryList<MatChipRow> = undefined!;

  /**
   * Emits whenever the component state changes and should cause the parent
   * form-field to update. Implemented as part of `MatFormFieldControl`.
   * @docs-private
   */
  readonly stateChanges = new Subject<void>();

  /** Whether the chip grid is in an error state. */
  get errorState() {
    return this._errorStateTracker.errorState;
  }
  set errorState(value: boolean) {
    this._errorStateTracker.errorState = value;
  }

  constructor(...args: unknown[]);

  constructor() {
    super();

    const parentForm = inject(NgForm, {optional: true});
    const parentFormGroup = inject(FormGroupDirective, {optional: true});
    const defaultErrorStateMatcher = inject(ErrorStateMatcher);

    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }

    this._errorStateTracker = new _ErrorStateTracker(
      defaultErrorStateMatcher,
      this.ngControl,
      parentFormGroup,
      parentForm,
      this.stateChanges,
    );
  }

  ngAfterContentInit() {
    this.chipBlurChanges.pipe(takeUntil(this._destroyed)).subscribe(() => {
      this._blur();
      this.stateChanges.next();
    });

    merge(this.chipFocusChanges, this._chips.changes)
      .pipe(takeUntil(this._destroyed))
      .subscribe(() => this.stateChanges.next());
  }

  override ngAfterViewInit() {
    super.ngAfterViewInit();

    if (!this._chipInput && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw Error('mat-chip-grid must be used in combination with matChipInputFor.');
    }
  }

  ngDoCheck() {
    if (this.ngControl) {
      // We need to re-evaluate this on every change detection cycle, because there are some
      // error triggers that we can't subscribe to (e.g. parent form submissions). This means
      // that whatever logic is in here has to be super lean or we risk destroying the performance.
      this.updateErrorState();
    }
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    this.stateChanges.complete();
  }

  /** Associates an HTML input element with this chip grid. */
  registerInput(inputElement: MatChipTextControl): void {
    this._chipInput = inputElement;
    this._chipInput.setDescribedByIds(this._ariaDescribedbyIds);
  }

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  onContainerClick(event: MouseEvent) {
    if (!this.disabled && !this._originatesFromChip(event)) {
      this.focus();
    }
  }

  /**
   * Focuses the first chip in this chip grid, or the associated input when there
   * are no eligible chips.
   */
  override focus(): void {
    if (this.disabled || this._chipInput.focused) {
      return;
    }

    if (!this._chips.length || this._chips.first.disabled) {
      // Delay until the next tick, because this can cause a "changed after checked"
      // error if the input does something on focus (e.g. opens an autocomplete).
      Promise.resolve().then(() => this._chipInput.focus());
    } else {
      const activeItem = this._keyManager.activeItem;

      if (activeItem) {
        activeItem.focus();
      } else {
        this._keyManager.setFirstItemActive();
      }
    }

    this.stateChanges.next();
  }

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  setDescribedByIds(ids: string[]) {
    // We must keep this up to date to handle the case where ids are set
    // before the chip input is registered.
    this._ariaDescribedbyIds = ids;
    this._chipInput?.setDescribedByIds(ids);
  }

  /**
   * Implemented as part of ControlValueAccessor.
   * @docs-private
   */
  writeValue(value: any): void {
    // The user is responsible for creating the child chips, so we just store the value.
    this._value = value;
  }

  /**
   * Implemented as part of ControlValueAccessor.
   * @docs-private
   */
  registerOnChange(fn: (value: any) => void): void {
    this._onChange = fn;
  }

  /**
   * Implemented as part of ControlValueAccessor.
   * @docs-private
   */
  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  /**
   * Implemented as part of ControlValueAccessor.
   * @docs-private
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.stateChanges.next();
  }

  /** Refreshes the error state of the chip grid. */
  updateErrorState() {
    this._errorStateTracker.updateErrorState();
  }

  /** When blurred, mark the field as touched when focus moved outside the chip grid. */
  _blur() {
    if (!this.disabled) {
      // Check whether the focus moved to chip input.
      // If the focus is not moved to chip input, mark the field as touched. If the focus moved
      // to chip input, do nothing.
      // Timeout is needed to wait for the focus() event trigger on chip input.
      setTimeout(() => {
        if (!this.focused) {
          this._propagateChanges();
          this._markAsTouched();
        }
      });
    }
  }

  /**
   * Removes the `tabindex` from the chip grid and resets it back afterwards, allowing the
   * user to tab out of it. This prevents the grid from capturing focus and redirecting
   * it back to the first chip, creating a focus trap, if it user tries to tab away.
   */
  protected override _allowFocusEscape() {
    if (!this._chipInput.focused) {
      super._allowFocusEscape();
    }
  }

  /** Handles custom keyboard events. */
  override _handleKeydown(event: KeyboardEvent) {
    const keyCode = event.keyCode;
    const activeItem = this._keyManager.activeItem;

    if (keyCode === TAB) {
      if (
        this._chipInput.focused &&
        hasModifierKey(event, 'shiftKey') &&
        this._chips.length &&
        !this._chips.last.disabled
      ) {
        event.preventDefault();

        if (activeItem) {
          this._keyManager.setActiveItem(activeItem);
        } else {
          this._focusLastChip();
        }
      } else {
        // Use the super method here since it doesn't check for the input
        // focused state. This allows focus to escape if there's only one
        // disabled chip left in the list.
        super._allowFocusEscape();
      }
    } else if (!this._chipInput.focused) {
      // The up and down arrows are supposed to navigate between the individual rows in the grid.
      // We do this by filtering the actions down to the ones that have the same `_isPrimary`
      // flag as the active action and moving focus between them ourseles instead of delegating
      // to the key manager. For more information, see #29359 and:
      // https://www.w3.org/WAI/ARIA/apg/patterns/grid/examples/layout-grids/#ex2_label
      if ((keyCode === UP_ARROW || keyCode === DOWN_ARROW) && activeItem) {
        const eligibleActions = this._chipActions.filter(
          action => action._isPrimary === activeItem._isPrimary && !this._skipPredicate(action),
        );
        const currentIndex = eligibleActions.indexOf(activeItem);
        const delta = event.keyCode === UP_ARROW ? -1 : 1;

        event.preventDefault();
        if (currentIndex > -1 && this._isValidIndex(currentIndex + delta)) {
          this._keyManager.setActiveItem(eligibleActions[currentIndex + delta]);
        }
      } else {
        super._handleKeydown(event);
      }
    }

    this.stateChanges.next();
  }

  _focusLastChip() {
    if (this._chips.length) {
      this._chips.last.focus();
    }
  }

  /** Emits change event to set the model value. */
  private _propagateChanges(): void {
    const valueToEmit = this._chips.length ? this._chips.toArray().map(chip => chip.value) : [];
    this._value = valueToEmit;
    this.change.emit(new MatChipGridChange(this, valueToEmit));
    this.valueChange.emit(valueToEmit);
    this._onChange(valueToEmit);
    this._changeDetectorRef.markForCheck();
  }

  /** Mark the field as touched */
  private _markAsTouched() {
    this._onTouched();
    this._changeDetectorRef.markForCheck();
    this.stateChanges.next();
  }
}
