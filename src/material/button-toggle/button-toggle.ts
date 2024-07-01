/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FocusMonitor} from '@angular/cdk/a11y';
import {SelectionModel} from '@angular/cdk/collections';
import {DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW, UP_ARROW, SPACE, ENTER} from '@angular/cdk/keycodes';
import {
  AfterContentInit,
  Attribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  Directive,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  QueryList,
  ViewChild,
  ViewEncapsulation,
  InjectionToken,
  Inject,
  AfterViewInit,
  booleanAttribute,
} from '@angular/core';
import {Direction, Directionality} from '@angular/cdk/bidi';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {MatRipple, MatPseudoCheckbox} from '@angular/material/core';

/**
 * @deprecated No longer used.
 * @breaking-change 11.0.0
 */
export type ToggleType = 'checkbox' | 'radio';

/** Possible appearance styles for the button toggle. */
export type MatButtonToggleAppearance = 'legacy' | 'standard';

/**
 * Represents the default options for the button toggle that can be configured
 * using the `MAT_BUTTON_TOGGLE_DEFAULT_OPTIONS` injection token.
 */
export interface MatButtonToggleDefaultOptions {
  /**
   * Default appearance to be used by button toggles. Can be overridden by explicitly
   * setting an appearance on a button toggle or group.
   */
  appearance?: MatButtonToggleAppearance;
  /** Whetehr icon indicators should be hidden for single-selection button toggle groups. */
  hideSingleSelectionIndicator?: boolean;
  /** Whether icon indicators should be hidden for multiple-selection button toggle groups. */
  hideMultipleSelectionIndicator?: boolean;
}

/**
 * Injection token that can be used to configure the
 * default options for all button toggles within an app.
 */
export const MAT_BUTTON_TOGGLE_DEFAULT_OPTIONS = new InjectionToken<MatButtonToggleDefaultOptions>(
  'MAT_BUTTON_TOGGLE_DEFAULT_OPTIONS',
  {
    providedIn: 'root',
    factory: MAT_BUTTON_TOGGLE_GROUP_DEFAULT_OPTIONS_FACTORY,
  },
);

export function MAT_BUTTON_TOGGLE_GROUP_DEFAULT_OPTIONS_FACTORY(): MatButtonToggleDefaultOptions {
  return {
    hideSingleSelectionIndicator: false,
    hideMultipleSelectionIndicator: false,
  };
}

/**
 * Injection token that can be used to reference instances of `MatButtonToggleGroup`.
 * It serves as alternative token to the actual `MatButtonToggleGroup` class which
 * could cause unnecessary retention of the class and its component metadata.
 */
export const MAT_BUTTON_TOGGLE_GROUP = new InjectionToken<MatButtonToggleGroup>(
  'MatButtonToggleGroup',
);

/**
 * Provider Expression that allows mat-button-toggle-group to register as a ControlValueAccessor.
 * This allows it to support [(ngModel)].
 * @docs-private
 */
export const MAT_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MatButtonToggleGroup),
  multi: true,
};

// Counter used to generate unique IDs.
let uniqueIdCounter = 0;

/** Change event object emitted by button toggle. */
export class MatButtonToggleChange {
  constructor(
    /** The button toggle that emits the event. */
    public source: MatButtonToggle,

    /** The value assigned to the button toggle. */
    public value: any,
  ) {}
}

/** Exclusive selection button toggle group that behaves like a radio-button group. */
@Directive({
  selector: 'mat-button-toggle-group',
  providers: [
    MAT_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR,
    {provide: MAT_BUTTON_TOGGLE_GROUP, useExisting: MatButtonToggleGroup},
  ],
  host: {
    'class': 'mat-button-toggle-group',
    '(keydown)': '_keydown($event)',
    '[attr.role]': "multiple ? 'group' : 'radiogroup'",
    '[attr.aria-disabled]': 'disabled',
    '[class.mat-button-toggle-vertical]': 'vertical',
    '[class.mat-button-toggle-group-appearance-standard]': 'appearance === "standard"',
  },
  exportAs: 'matButtonToggleGroup',
  standalone: true,
})
export class MatButtonToggleGroup implements ControlValueAccessor, OnInit, AfterContentInit {
  private _multiple = false;
  private _disabled = false;
  private _selectionModel: SelectionModel<MatButtonToggle>;

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
    descendants: true,
  })
  _buttonToggles: QueryList<MatButtonToggle>;

  /** The appearance for all the buttons in the group. */
  @Input() appearance: MatButtonToggleAppearance;

  /** `name` attribute for the underlying `input` element. */
  @Input()
  get name(): string {
    return this._name;
  }
  set name(value: string) {
    this._name = value;
    this._markButtonsForCheck();
  }
  private _name = `mat-button-toggle-group-${uniqueIdCounter++}`;

  /** Whether the toggle group is vertical. */
  @Input({transform: booleanAttribute}) vertical: boolean;

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

  /**
   * Event that emits whenever the value of the group changes.
   * Used to facilitate two-way data binding.
   * @docs-private
   */
  @Output() readonly valueChange = new EventEmitter<any>();

  /** Selected button toggles in the group. */
  get selected(): MatButtonToggle | MatButtonToggle[] {
    const selected = this._selectionModel ? this._selectionModel.selected : [];
    return this.multiple ? selected : selected[0] || null;
  }

  /** Whether multiple button toggles can be selected. */
  @Input({transform: booleanAttribute})
  get multiple(): boolean {
    return this._multiple;
  }
  set multiple(value: boolean) {
    this._multiple = value;
    this._markButtonsForCheck();
  }

  /** Whether multiple button toggle group is disabled. */
  @Input({transform: booleanAttribute})
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = value;
    this._markButtonsForCheck();
  }

  /** The layout direction of the toggle button group. */
  get dir(): Direction {
    return this._dir && this._dir.value === 'rtl' ? 'rtl' : 'ltr';
  }

  /** Event emitted when the group's value changes. */
  @Output() readonly change: EventEmitter<MatButtonToggleChange> =
    new EventEmitter<MatButtonToggleChange>();

  /** Whether checkmark indicator for single-selection button toggle groups is hidden. */
  @Input({transform: booleanAttribute})
  get hideSingleSelectionIndicator(): boolean {
    return this._hideSingleSelectionIndicator;
  }
  set hideSingleSelectionIndicator(value: boolean) {
    this._hideSingleSelectionIndicator = value;
    this._markButtonsForCheck();
  }
  private _hideSingleSelectionIndicator: boolean;

  /** Whether checkmark indicator for multiple-selection button toggle groups is hidden. */
  @Input({transform: booleanAttribute})
  get hideMultipleSelectionIndicator(): boolean {
    return this._hideMultipleSelectionIndicator;
  }
  set hideMultipleSelectionIndicator(value: boolean) {
    this._hideMultipleSelectionIndicator = value;
    this._markButtonsForCheck();
  }
  private _hideMultipleSelectionIndicator: boolean;

  constructor(
    private _changeDetector: ChangeDetectorRef,
    @Optional()
    @Inject(MAT_BUTTON_TOGGLE_DEFAULT_OPTIONS)
    defaultOptions?: MatButtonToggleDefaultOptions,
    @Optional() private _dir?: Directionality,
  ) {
    this.appearance =
      defaultOptions && defaultOptions.appearance ? defaultOptions.appearance : 'standard';
    this.hideSingleSelectionIndicator = defaultOptions?.hideSingleSelectionIndicator ?? false;
    this.hideMultipleSelectionIndicator = defaultOptions?.hideMultipleSelectionIndicator ?? false;
  }

  ngOnInit() {
    this._selectionModel = new SelectionModel<MatButtonToggle>(this.multiple, undefined, false);
  }

  ngAfterContentInit() {
    this._selectionModel.select(...this._buttonToggles.filter(toggle => toggle.checked));
    if (!this.multiple) {
      this._initializeTabIndex();
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

  /** Handle keydown event calling to single-select button toggle. */
  protected _keydown(event: KeyboardEvent) {
    if (this.multiple || this.disabled) {
      return;
    }

    const target = event.target as HTMLButtonElement;
    const buttonId = target.id;
    const index = this._buttonToggles.toArray().findIndex(toggle => {
      return toggle.buttonId === buttonId;
    });

    let nextButton: MatButtonToggle | null = null;
    switch (event.keyCode) {
      case SPACE:
      case ENTER:
        nextButton = this._buttonToggles.get(index) || null;
        break;
      case UP_ARROW:
        nextButton = this._getNextButton(index, -1);
        break;
      case LEFT_ARROW:
        nextButton = this._getNextButton(index, this.dir === 'ltr' ? -1 : 1);
        break;
      case DOWN_ARROW:
        nextButton = this._getNextButton(index, 1);
        break;
      case RIGHT_ARROW:
        nextButton = this._getNextButton(index, this.dir === 'ltr' ? 1 : -1);
        break;
      default:
        return;
    }

    if (nextButton) {
      event.preventDefault();
      nextButton._onButtonClick();
      nextButton.focus();
    }
  }

  /** Dispatch change event with current selection and group value. */
  _emitChangeEvent(toggle: MatButtonToggle): void {
    const event = new MatButtonToggleChange(toggle, this.value);
    this._rawValue = event.value;
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
  _syncButtonToggle(
    toggle: MatButtonToggle,
    select: boolean,
    isUserInput = false,
    deferEvents = false,
  ) {
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
      Promise.resolve().then(() => this._updateModelValue(toggle, isUserInput));
    } else {
      this._updateModelValue(toggle, isUserInput);
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

  /** Initializes the tabindex attribute using the radio pattern. */
  private _initializeTabIndex() {
    this._buttonToggles.forEach(toggle => {
      toggle.tabIndex = -1;
    });
    if (this.selected) {
      (this.selected as MatButtonToggle).tabIndex = 0;
    } else {
      for (let i = 0; i < this._buttonToggles.length; i++) {
        const toggle = this._buttonToggles.get(i)!;

        if (!toggle.disabled) {
          toggle.tabIndex = 0;
          break;
        }
      }
    }
    this._markButtonsForCheck();
  }

  /** Obtain the subsequent toggle to which the focus shifts. */
  private _getNextButton(startIndex: number, offset: number): MatButtonToggle | null {
    const items = this._buttonToggles;

    for (let i = 1; i <= items.length; i++) {
      const index = (startIndex + offset * i + items.length) % items.length;
      const item = items.get(index);

      if (item && !item.disabled) {
        return item;
      }
    }

    return null;
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
    this._buttonToggles.forEach(toggle => {
      toggle.checked = false;
      // If the button toggle is in single select mode, initialize the tabIndex.
      if (!this.multiple) {
        toggle.tabIndex = -1;
      }
    });
  }

  /** Selects a value if there's a toggle that corresponds to it. */
  private _selectValue(value: any) {
    const correspondingOption = this._buttonToggles.find(toggle => {
      return toggle.value != null && toggle.value === value;
    });

    if (correspondingOption) {
      correspondingOption.checked = true;
      this._selectionModel.select(correspondingOption);
      if (!this.multiple) {
        // If the button toggle is in single select mode, reset the tabIndex.
        correspondingOption.tabIndex = 0;
      }
    }
  }

  /** Syncs up the group's value with the model and emits the change event. */
  private _updateModelValue(toggle: MatButtonToggle, isUserInput: boolean) {
    // Only emit the change event for user input.
    if (isUserInput) {
      this._emitChangeEvent(toggle);
    }

    // Note: we emit this one no matter whether it was a user interaction, because
    // it is used by Angular to sync up the two-way data binding.
    this.valueChange.emit(this.value);
  }

  /** Marks all of the child button toggles to be checked. */
  private _markButtonsForCheck() {
    this._buttonToggles?.forEach(toggle => toggle._markForCheck());
  }
}

/** Single button inside of a toggle group. */
@Component({
  selector: 'mat-button-toggle',
  templateUrl: 'button-toggle.html',
  styleUrl: 'button-toggle.css',
  encapsulation: ViewEncapsulation.None,
  exportAs: 'matButtonToggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.mat-button-toggle-standalone]': '!buttonToggleGroup',
    '[class.mat-button-toggle-checked]': 'checked',
    '[class.mat-button-toggle-disabled]': 'disabled',
    '[class.mat-button-toggle-appearance-standard]': 'appearance === "standard"',
    'class': 'mat-button-toggle',
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
    '[attr.id]': 'id',
    '[attr.name]': 'null',
    '(focus)': 'focus()',
    'role': 'presentation',
  },
  standalone: true,
  imports: [MatRipple, MatPseudoCheckbox],
})
export class MatButtonToggle implements OnInit, AfterViewInit, OnDestroy {
  private _checked = false;

  /**
   * Attached to the aria-label attribute of the host element. In most cases, aria-labelledby will
   * take precedence so this may be omitted.
   */
  @Input('aria-label') ariaLabel: string;

  /**
   * Users can specify the `aria-labelledby` attribute which will be forwarded to the input element
   */
  @Input('aria-labelledby') ariaLabelledby: string | null = null;

  /** Underlying native `button` element. */
  @ViewChild('button') _buttonElement: ElementRef<HTMLButtonElement>;

  /** The parent button toggle group (exclusive selection). Optional. */
  buttonToggleGroup: MatButtonToggleGroup;

  /** Unique ID for the underlying `button` element. */
  get buttonId(): string {
    return `${this.id}-button`;
  }

  /** The unique ID for this button toggle. */
  @Input() id: string;

  /** HTML's 'name' attribute used to group radios for unique selection. */
  @Input() name: string;

  /** MatButtonToggleGroup reads this to assign its own value. */
  @Input() value: any;

  /** Tabindex of the toggle. */
  @Input()
  get tabIndex(): number | null {
    return this._tabIndex;
  }
  set tabIndex(value: number | null) {
    this._tabIndex = value;
    this._markForCheck();
  }
  private _tabIndex: number | null;

  /** Whether ripples are disabled on the button toggle. */
  @Input({transform: booleanAttribute}) disableRipple: boolean;

  /** The appearance style of the button. */
  @Input()
  get appearance(): MatButtonToggleAppearance {
    return this.buttonToggleGroup ? this.buttonToggleGroup.appearance : this._appearance;
  }
  set appearance(value: MatButtonToggleAppearance) {
    this._appearance = value;
  }
  private _appearance: MatButtonToggleAppearance;

  /** Whether the button is checked. */
  @Input({transform: booleanAttribute})
  get checked(): boolean {
    return this.buttonToggleGroup ? this.buttonToggleGroup._isSelected(this) : this._checked;
  }
  set checked(value: boolean) {
    if (value !== this._checked) {
      this._checked = value;

      if (this.buttonToggleGroup) {
        this.buttonToggleGroup._syncButtonToggle(this, this._checked);
      }

      this._changeDetectorRef.markForCheck();
    }
  }

  /** Whether the button is disabled. */
  @Input({transform: booleanAttribute})
  get disabled(): boolean {
    return this._disabled || (this.buttonToggleGroup && this.buttonToggleGroup.disabled);
  }
  set disabled(value: boolean) {
    this._disabled = value;
  }
  private _disabled: boolean = false;

  /** Event emitted when the group value changes. */
  @Output() readonly change: EventEmitter<MatButtonToggleChange> =
    new EventEmitter<MatButtonToggleChange>();

  constructor(
    @Optional() @Inject(MAT_BUTTON_TOGGLE_GROUP) toggleGroup: MatButtonToggleGroup,
    private _changeDetectorRef: ChangeDetectorRef,
    private _elementRef: ElementRef<HTMLElement>,
    private _focusMonitor: FocusMonitor,
    @Attribute('tabindex') defaultTabIndex: string,
    @Optional()
    @Inject(MAT_BUTTON_TOGGLE_DEFAULT_OPTIONS)
    defaultOptions?: MatButtonToggleDefaultOptions,
  ) {
    const parsedTabIndex = Number(defaultTabIndex);
    this.tabIndex = parsedTabIndex || parsedTabIndex === 0 ? parsedTabIndex : null;
    this.buttonToggleGroup = toggleGroup;
    this.appearance =
      defaultOptions && defaultOptions.appearance ? defaultOptions.appearance : 'standard';
  }

  ngOnInit() {
    const group = this.buttonToggleGroup;
    this.id = this.id || `mat-button-toggle-${uniqueIdCounter++}`;

    if (group) {
      if (group._isPrechecked(this)) {
        this.checked = true;
      } else if (group._isSelected(this) !== this._checked) {
        // As side effect of the circular dependency between the toggle group and the button,
        // we may end up in a state where the button is supposed to be checked on init, but it
        // isn't, because the checked value was assigned too early. This can happen when Ivy
        // assigns the static input value before the `ngOnInit` has run.
        group._syncButtonToggle(this, this._checked);
      }
    }
  }

  ngAfterViewInit() {
    this._focusMonitor.monitor(this._elementRef, true);
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
    this._buttonElement.nativeElement.focus(options);
  }

  /** Checks the button toggle due to an interaction with the underlying native button. */
  _onButtonClick() {
    const newChecked = this.isSingleSelector() ? true : !this._checked;

    if (newChecked !== this._checked) {
      this._checked = newChecked;
      if (this.buttonToggleGroup) {
        this.buttonToggleGroup._syncButtonToggle(this, this._checked, true);
        this.buttonToggleGroup._onTouched();
      }
    }

    if (this.isSingleSelector()) {
      const focusable = this.buttonToggleGroup._buttonToggles.find(toggle => {
        return toggle.tabIndex === 0;
      });
      // Modify the tabindex attribute of the last focusable button toggle to -1.
      if (focusable) {
        focusable.tabIndex = -1;
      }
      // Modify the tabindex attribute of the presently selected button toggle to 0.
      this.tabIndex = 0;
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

  /** Gets the name that should be assigned to the inner DOM node. */
  _getButtonName(): string | null {
    if (this.isSingleSelector()) {
      return this.buttonToggleGroup.name;
    }
    return this.name || null;
  }

  /** Whether the toggle is in single selection mode. */
  isSingleSelector(): boolean {
    return this.buttonToggleGroup && !this.buttonToggleGroup.multiple;
  }
}
