/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AfterContentInit,
  AfterViewInit,
  Attribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  Directive,
  ElementRef,
  EventEmitter,
  forwardRef,
  Inject,
  InjectionToken,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  QueryList,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {
  CanColorCtor,
  CanDisableCtor,
  CanDisableRippleCtor,
  MatRipple,
  mixinColor,
  mixinDisabled,
  mixinDisableRipple,
  RippleAnimationConfig
} from '@angular/material/core';
import {numbers} from '@material/ripple';
import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';
import {FocusMonitor} from '@angular/cdk/a11y';
import {SelectionModel} from '@angular/cdk/collections';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

/** Configuration for the ripple animation. */
const RIPPLE_ANIMATION_CONFIG: RippleAnimationConfig = {
  enterDuration: numbers.DEACTIVATION_TIMEOUT_MS,
  exitDuration: numbers.FG_DEACTIVATION_MS
};

// Boilerplate for applying mixins to MatButtonToggle.
/** @docs-private */
export class MatButtonToggleMixinCore {
  constructor(public _elementRef: ElementRef) {
  }
}

/**
 * Injection token that can be used to reference instances of `MatButtonToggleGroup`.
 * It serves as alternative token to the actual `MatButtonToggleGroup` class which
 * could cause unnecessary retention of the class and its component metadata.
 */
export const MAT_BUTTON_TOGGLE_GROUP =
  new InjectionToken<MatButtonToggleGroup>('MatButtonToggleGroup');

/**
 * Provider Expression that allows mat-button-toggle-group to register as a ControlValueAccessor.
 * This allows it to support [(ngModel)].
 * @docs-private
 */
export const MAT_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MatButtonToggleGroup),
  multi: true
};

let _uniqueIdCounter = 0;

/** Change event object emitted by MatButtonToggle. */
export class MatButtonToggleChange {
  constructor(
    /** MatButtonToggle that emits the event. */
    public source: MatButtonToggle,
    /** Value assigned to the MatButtonToggle. */
    public value: any) {
  }
}

export const _MatButtonToggleBaseMixin: CanDisableRippleCtor & CanDisableCtor & CanColorCtor &
  typeof MatButtonToggleMixinCore =
  mixinColor(mixinDisabled(mixinDisableRipple(MatButtonToggleMixinCore)));

/** Selection button toggle group. */
@Directive({
  selector: 'mat-button-toggle-group',
  providers: [
    MAT_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR,
    {provide: MAT_BUTTON_TOGGLE_GROUP, useExisting: MatButtonToggleGroup},
  ],
  host: {
    '[attr.role]': 'multiple ? "group" : "radiogroup"',
    'class': 'mat-mdc-button-toggle-group mdc-segmented-button',
    '[attr.aria-disabled]': 'disabled',
    '[class.mdc-segmented-button__single-select]': '!multiple',
  },
  exportAs: 'matButtonToggleGroup',
})
export class MatButtonToggleGroup implements ControlValueAccessor, OnInit, AfterViewInit,
  AfterContentInit {
  /**
   * Reference to the raw value that the consumer tried to assign. The real
   * value will exclude any values from this one that don't correspond to a
   * toggle. Useful for the cases where the value is assigned before the toggles
   * have been initialized or at the same that they're being swapped out.
   */
  private _rawValue: any;

  /**
   * The method to be called in order to update ngModel.
   * Now `ngModel` binding is not supported in multiple selection mode.
   */
  _controlValueAccessorChangeFn: (value: any) => void = () => {};

  /** onTouch function registered via registerOnTouch (ControlValueAccessor). */
  _onTouched: () => any = () => {};

  /** Child button toggle buttons. */
  @ContentChildren(forwardRef(() => MatButtonToggle), {
    // Note that this would technically pick up toggles
    // from nested groups, but that's not a case that we support.
    descendants: true
  }) _buttonToggles: QueryList<MatButtonToggle>;

  private _selectionModel: SelectionModel<MatButtonToggle>;

  constructor(private _changeDetector: ChangeDetectorRef) {}

  /**
   * Not yet implemented
   */
  @Input() vertical: boolean;

  /**
   * @deprecated No longer used.
   * @breaking-change 12.0.0
   */
  @Input() appearance: 'legacy' | 'standard';

  /**
   * Event that emits whenever the value of the group changes.
   * Used to facilitate two-way data binding.
   * @docs-private
   */
  @Output() readonly valueChange = new EventEmitter<any>();

  /** Event emitted when the group's value changes. */
  @Output() readonly change: EventEmitter<MatButtonToggleChange> =
    new EventEmitter<MatButtonToggleChange>();

  /** Selected button toggles in the group. */
  get selected() {
    const selected = this._selectionModel ? this._selectionModel.selected : [];
    return this.multiple ? selected : (selected[0] || null);
  }

  /** `name` attribute for the underlying `input` element. */
  @Input()
  get name(): string { return this._name; }
  set name(value: string) {
    this._name = value;

    if (this._buttonToggles) {
      this._buttonToggles.forEach(toggle => {
        toggle.name = this._name;
        toggle._markForCheck();
      });
    }
  }

  private _name = `mat-mdc-button-toggle-group-${_uniqueIdCounter++}`;

  /** Whether multiple button toggles can be selected. */
  @Input()
  get multiple(): boolean { return this._multiple; }
  set multiple(value: boolean) {
    this._multiple = coerceBooleanProperty(value);
  }
  private _multiple = false;

  /** Whether multiple button toggle group is disabled. */
  @Input()
  get disabled(): boolean { return this._disabled; }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);

    if (this._buttonToggles) {
      this._buttonToggles.forEach(toggle => toggle._markForCheck());
    }
  }
  private _disabled = false;

  /** Value of the toggle group. */
  @Input()
  get value(): any {
    const selected = this._selectionModel ? this._selectionModel.selected : [];

    if (this.multiple) {
      return selected.map(toggle => toggle.value);
    }
    return selected[0] ? selected[0].value : undefined;
  }

  set value(newValue: any) {
    this._setSelectionByValue(newValue);
    this.valueChange.emit(this.value);
  }

  ngOnInit() {
    this._selectionModel = new SelectionModel<MatButtonToggle>(this.multiple, undefined, false);
  }

  ngAfterContentInit() {
    this._selectionModel.select(...this._buttonToggles.filter(toggle => toggle.checked));
  }

  ngAfterViewInit() {
    const selectedSegments =
      this._buttonToggles.filter((toggle) => toggle.checked);
    // if (_isSingleSelect && selectedSegments.length == 0 &&
    //   this._buttonToggles.length > 0) {
    //   throw new Error(
    //     'No mat-button-toggle selected in singleSelect mat-button-toggle-group');
    // } else
    if (!this.multiple && selectedSegments.length > 1) {
      throw new Error(
        'Multiple mat-button-toggle selected in singleSelect mat-button-toggle-group');
    }
  }

  /**
   * Sets the model value. Implemented as part of ControlValueAccessor.
   * @param value Value to be set to the model.
   */
  writeValue(value: any) {
    this.value = value;
    this._changeDetector.markForCheck();
  }

  // Implemented as part of ControlValueAccessor.
  registerOnChange(fn: (value: any) => void) {
    this._controlValueAccessorChangeFn = fn;
  }

  // Implemented as part of ControlValueAccessor.
  registerOnTouched(fn: any) {
    this._onTouched = fn;
  }

  // Implemented as part of ControlValueAccessor.
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  /** Dispatch change event with current selection and group value. */
  _emitChangeEvent(): void {
    const selected = this.selected;
    const source = Array.isArray(selected) ? selected[selected.length - 1] : selected;
    const event = new MatButtonToggleChange(source!, this.value);
    this._controlValueAccessorChangeFn(event.value);
    this.change.emit(event);
  }

  /**
   * Syncs a button toggle's selected state with the model value.
   * @param toggle Toggle to be synced.
   * @param select Whether the toggle should be selected.
   * @param isUserInput Whether the change was a result of a user interaction.
   * @param deferEvents Whether to defer emitting the change events.
   */
  _syncButtonToggle(toggle: MatButtonToggle,
                    select: boolean,
                    isUserInput = false,
                    deferEvents = false) {
    // Deselect the currently-selected toggle, if we're in single-selection
    // mode and the button being toggled isn't selected at the moment.
    if (!this.multiple && this.selected && !toggle.checked) {
      (this.selected as MatButtonToggle).checked = false;
    }

    if (this._selectionModel) {
      if (select) {
        this._selectionModel.select(toggle);
      } else {
        this._selectionModel.deselect(toggle);
      }
    } else {
      deferEvents = true;
    }

    // We need to defer in some cases in order to avoid "changed after checked errors", however
    // the side-effect is that we may end up updating the model value out of sequence in others
    // The `deferEvents` flag allows us to decide whether to do it on a case-by-case basis.
    if (deferEvents) {
      Promise.resolve().then(() => this._updateModelValue(isUserInput));
    } else {
      this._updateModelValue(isUserInput);
    }
  }

  /** Checks whether a button toggle is selected. */
  _isSelected(toggle: MatButtonToggle) {
    return this._selectionModel && this._selectionModel.isSelected(toggle);
  }

  /** Determines whether a button toggle should be checked on init. */
  _isPrechecked(toggle: MatButtonToggle) {
    if (typeof this._rawValue === 'undefined') {
      return false;
    }

    if (this.multiple && Array.isArray(this._rawValue)) {
      return this._rawValue.some(value => toggle.value != null && value === toggle.value);
    }

    return toggle.value === this._rawValue;
  }

  /** Updates the selection state of the toggles in the group based on a value. */
  private _setSelectionByValue(value: any | any[]) {
    this._rawValue = value;

    if (!this._buttonToggles) {
      return;
    }

    if (this.multiple && value) {
      if (!Array.isArray(value) && (typeof ngDevMode === 'undefined' || ngDevMode)) {
        throw Error('Value must be an array in multiple-selection mode.');
      }

      this._clearSelection();
      value.forEach((currentValue: any) => this._selectValue(currentValue));
    } else {
      this._clearSelection();
      this._selectValue(value);
    }
  }

  /** Clears the selected toggles. */
  private _clearSelection() {
    this._selectionModel.clear();
  }

  /** Selects a value if there's a toggle that corresponds to it. */
  _selectValue(value: any) {
    const correspondingOption = this._buttonToggles.find(toggle => {
      return toggle.value != null && toggle.value === value;
    });

    if (correspondingOption) {
      correspondingOption.checked = true;
      this._selectionModel.select(correspondingOption);
    }
  }

  /** Syncs up the group's value with the model and emits the change event. */
  private _updateModelValue(isUserInput: boolean) {
    // Only emit the change event for user input.
    if (isUserInput) {
      this._emitChangeEvent();
    }

    // Note: we emit this one no matter whether it was a user interaction, because
    // it is used by Angular to sync up the two-way data binding.
    this.valueChange.emit(this.value);
  }

  static ngAcceptInputType_disabled: BooleanInput;
  static ngAcceptInputType_multiple: BooleanInput;
  static ngAcceptInputType_vertical: BooleanInput;
}

@Component({
  selector: 'button[mat-button-toggle]',
  templateUrl: 'button-toggle.html',
  styleUrls: ['button-toggle.css'],
  host: {
    'class': 'mat-mdc-button-toggle mdc-segmented-button__segment',
    '[class.mdc-segmented-button__segment--selected]': 'checked',
    '[attr.aria-pressed]' : 'checked',
    '[attr.role]' : 'buttonToggleGroup?.multiple ? null : "radio"',
    '[attr.name]' : 'name || null',
    '[attr.aria-label]' : 'ariaLabel',
    '[attr.aria-labelledby]' : 'ariaLabelledby',
    '[attr.tabindex]' : 'disabled ? -1 : tabIndex',
    '[disabled]' : 'disabled || null',
    '(focus)': 'focus()',
    '(click)' : '_onButtonClick()',
  },
  exportAs: 'matButtonToggle',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  inputs: ['disableRipple'],
})
export class MatButtonToggle extends _MatButtonToggleBaseMixin implements OnInit,
  OnDestroy {

  /**
   * @deprecated No longer used.
   * @breaking-change 12.0.0
   */
  @Input() appearance: 'legacy' | 'standard';

  /**
   * Attached to the aria-label attribute of the host element. In most cases, aria-labelledby will
   * take precedence so this may be omitted.
   */
  @Input('aria-label') ariaLabel: string;
  /**
   * Users can specify the `aria-labelledby` attribute which will be forwarded to the input element
   */
  @Input('aria-labelledby') ariaLabelledby: string | null = null;

  /** The parent button toggle group (exclusive selection). Optional. */
  buttonToggleGroup: MatButtonToggleGroup;

  /** The unique ID for this button toggle. */
  @Input() id: string;

  /** HTML's 'name' attribute used to group radios for unique selection. */
  @Input() name: string;

  /** MatButtonToggleGroup reads this to assign its own value. */
  @Input() value: any;

  /** Tabindex for the toggle. */
  @Input() tabIndex: number | null;

  /** Whether this is a single select button toggle. */
  private _isSingleSelect = false;

  /** The ripple animation configuration to use for the buttons. */
  _rippleAnimation: RippleAnimationConfig = RIPPLE_ANIMATION_CONFIG;

  /** Whether the ripple is centered on the button. */
  _isRippleCentered = false;

  /** Reference to the MatRipple instance of the button. */
  @ViewChild(MatRipple) ripple: MatRipple;

  /** Unique ID for the underlying `button` element. */
  get buttonId(): string {
    return `${this.id}-button`;
  }

  /** Event emitted when the group value changes. */
  @Output() readonly change: EventEmitter<MatButtonToggleChange> =
    new EventEmitter<MatButtonToggleChange>();

  /** Whether the button is disabled. */
  @Input()
  get disabled(): boolean {
    return this._disabled || (this.buttonToggleGroup && this.buttonToggleGroup.disabled);
  }

  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
  }
  private _disabled: boolean = false;

  /** Whether the button is checked. */
  @Input()
  get checked(): boolean {
    return this.buttonToggleGroup ? this.buttonToggleGroup._isSelected(this) : this._checked;
  }

  set checked(value: boolean) {
    const newValue = coerceBooleanProperty(value);

    if (newValue !== this._checked) {
      this._checked = newValue;

      if (this.buttonToggleGroup) {
        this.buttonToggleGroup._syncButtonToggle(this, this._checked);
      }

      this._changeDetectorRef.markForCheck();
    }
  }
  private _checked = false;

  _isRippleDisabled() {
    return this.disableRipple || this.disabled;
  }

  constructor(@Optional() @Inject(MAT_BUTTON_TOGGLE_GROUP) toggleGroup: MatButtonToggleGroup,
              private _changeDetectorRef: ChangeDetectorRef,
              public _elementRef: ElementRef<HTMLElement>,
              private _focusMonitor: FocusMonitor,
              @Attribute('tabindex') defaultTabIndex: string) {
    super(_elementRef);

    const parsedTabIndex = Number(defaultTabIndex);
    this.tabIndex = (parsedTabIndex || parsedTabIndex === 0) ? parsedTabIndex : null;
    this.buttonToggleGroup = toggleGroup;
  }

  ngOnInit() {
    const group = this.buttonToggleGroup;
    this._isSingleSelect = group && !group.multiple;
    this.id = this.id || `mat-button-toggle-${_uniqueIdCounter++}`;

    if (this._isSingleSelect) {
      this.name = group.name;
    }

    if (group) {
      if (group._isPrechecked(this)) {
        this.checked = true;
      } else if (group._isSelected(this) !== this._checked) {
        // As as side effect of the circular dependency between the toggle group and the button,
        // we may end up in a state where the button is supposed to be checked on init, but it
        // isn't, because the checked value was assigned too early. This can happen when Ivy
        // assigns the static input value before the `ngOnInit` has run.
        group._syncButtonToggle(this, this._checked);
      }
    }
  }

  ngOnDestroy() {
    const group = this.buttonToggleGroup;

    this._focusMonitor.stopMonitoring(this._elementRef);

    // Remove the toggle from the selection once it's destroyed. Needs to happen
    // on the next tick in order to avoid "changed after checked" errors.
    if (group && group._isSelected(this)) {
      group._syncButtonToggle(this, false, false, true);
    }
  }

  /** Focuses the button. */
  focus(options?: FocusOptions): void {
    this._elementRef.nativeElement.focus(options);
  }

  /** Checks the button toggle due to an interaction with the underlying native button. */
  _onButtonClick() {
    const newChecked = this._isSingleSelect ? true : !this._checked;

    if (newChecked !== this._checked) {
      this._checked = newChecked;
      if (this.buttonToggleGroup) {
        this.buttonToggleGroup._syncButtonToggle(this, this._checked, true);
        this.buttonToggleGroup._onTouched();
      }
    }
    // Emit a change event when it's the single selector
    this.change.emit(new MatButtonToggleChange(this, this.value));
  }

  /**
   * Marks the button toggle as needing checking for change detection.
   * This method is exposed because the parent button toggle group will directly
   * update bound properties of the radio button.
   */
  _markForCheck() {
    // When the group value changes, the button will not be notified.
    // Use `markForCheck` to explicit update button toggle's status.
    this._changeDetectorRef.markForCheck();
  }

  static ngAcceptInputType_checked: BooleanInput;
  static ngAcceptInputType_disabled: BooleanInput;
  static ngAcceptInputType_vertical: BooleanInput;
  static ngAcceptInputType_multiple: BooleanInput;
  static ngAcceptInputType_disableRipple: BooleanInput;
}
