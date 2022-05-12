/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AfterContentInit,
  ChangeDetectorRef,
  ContentChildren,
  Directive,
  ElementRef,
  forwardRef,
  Inject,
  Input,
  OnDestroy,
  Optional,
  Output,
  QueryList,
} from '@angular/core';
import {ActiveDescendantKeyManager, Highlightable, ListKeyManagerOption} from '@angular/cdk/a11y';
import {DOWN_ARROW, ENTER, LEFT_ARROW, RIGHT_ARROW, SPACE, UP_ARROW} from '@angular/cdk/keycodes';
import {BooleanInput, coerceArray, coerceBooleanProperty} from '@angular/cdk/coercion';
import {SelectionModel} from '@angular/cdk/collections';
import {BehaviorSubject, defer, merge, Observable, Subject} from 'rxjs';
import {filter, mapTo, startWith, switchMap, takeUntil} from 'rxjs/operators';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {Directionality} from '@angular/cdk/bidi';
import {CDK_COMBOBOX, CdkCombobox} from '@angular/cdk-experimental/combobox';

/** The next id to use for the CdkOption directive. */
let nextOptionId = 0;

/** The next id to use for the CdkListbox directive. */
let nextListboxId = 0;

@Directive({
  selector: '[cdkOption]',
  exportAs: 'cdkOption',
  host: {
    'role': 'option',
    'class': 'cdk-option',
    '[id]': 'id',
    '[attr.aria-selected]': 'isSelected() || null',
    '[attr.tabindex]': '!listbox.useActiveDescendant && !disabled ? -1 : null',
    '[attr.aria-disabled]': 'disabled',
    '[class.cdk-option-disabled]': 'disabled',
    '[class.cdk-option-active]': 'isActive()',
    '[class.cdk-option-selected]': 'isSelected()',
    '(click)': '_clicked.next()',
  },
})
export class CdkOption<T = unknown> implements ListKeyManagerOption, Highlightable, OnDestroy {
  /** The id of the option's host element. */
  @Input() id = `cdk-option-${nextOptionId++}`;

  // TODO(mmalerba): What do we do if the user doesn't specify a value?
  /** The value of this option. */
  @Input('cdkOptionValue') value: T;

  /**
   * The text used to locate this item during listbox typeahead. If not specified,
   * the `textContent` of the item will be used.
   */
  @Input('cdkOptionTypeaheadLabel') typeaheadLabel: string;

  /** Whether this option is disabled. */
  @Input('cdkOptionDisabled')
  get disabled(): boolean {
    return this.listbox.disabled || this._disabled;
  }
  set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);
  }
  private _disabled: boolean = false;

  /** Emits when the option is destroyed. */
  protected destroyed = new Subject<void>();

  /** Emits when the option is clicked. */
  readonly _clicked = new Subject<void>();

  /** Whether the option is currently active. */
  private _active = false;

  constructor(
    /** The option's host element */
    protected readonly elementRef: ElementRef,
    /** The change detector ref for this option. */
    protected readonly changeDetectorRef: ChangeDetectorRef,
    /** The parent listbox this option belongs to. */
    @Inject(forwardRef(() => CdkListbox)) protected readonly listbox: CdkListbox<T>,
  ) {
    this.listbox._internalValueChange.pipe(takeUntil(this.destroyed)).subscribe(() => {
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  /** Whether this option is selected. */
  isSelected() {
    return this.listbox.isSelected(this.value);
  }

  /** Whether this option is active. */
  isActive() {
    return this._active;
  }

  /** Toggle the selected state of this option. */
  toggle() {
    this.listbox.toggle(this);
  }

  /** Select this option if it is not selected. */
  select() {
    this.listbox.select(this);
  }

  /** Deselect this option if it is selected. */
  deselect() {
    this.listbox.deselect(this);
  }

  /** Focus this option. */
  focus() {
    this.elementRef.nativeElement.focus();
  }

  /** Get the label for this element which is required by the FocusableOption interface. */
  getLabel() {
    return (this.typeaheadLabel ?? this.elementRef.nativeElement.textContent?.trim()) || '';
  }

  /** Set the option as active. */
  setActiveStyles() {
    this._active = true;
    this.changeDetectorRef.markForCheck();
  }

  /** Set the option as inactive. */
  setInactiveStyles() {
    this._active = false;
    this.changeDetectorRef.markForCheck();
  }
}

@Directive({
  selector: '[cdkListbox]',
  exportAs: 'cdkListbox',
  host: {
    'role': 'listbox',
    'class': 'cdk-listbox',
    '[id]': 'id',
    '[attr.tabindex]': 'disabled ? null : 0',
    '[attr.aria-disabled]': 'disabled',
    '[attr.aria-multiselectable]': 'multiple',
    '[attr.aria-activedescendant]': '_getAriaActiveDescendant()',
    '[attr.aria-orientation]': 'orientation',
    '(focus)': '_handleFocus()',
    '(keydown)': '_handleKeydown($event)',
    '(focusout)': '_handleFocusOut($event)',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CdkListbox),
      multi: true,
    },
  ],
})
export class CdkListbox<T = unknown> implements AfterContentInit, OnDestroy, ControlValueAccessor {
  /** The id of the option's host element. */
  @Input() id = `cdk-listbox-${nextListboxId++}`;

  // TODO(mmalerba): Should we normalize the order? Do we care about duplicates?
  /** The value selected in the listbox, represented as an array of option values. */
  @Input('cdkListboxValue')
  get value(): T[] {
    return this.selectionModel().selected;
  }
  set value(value: T[]) {
    this.selectionModel().setSelection(...coerceArray(value == null ? [] : value));
  }

  /**
   * Whether the listbox allows multiple options to be selected. If the value switches from `true`
   * to `false`, and more than one option is selected, all options are deselected.
   */
  @Input('cdkListboxMultiple')
  get multiple(): boolean {
    return this._multiple;
  }
  set multiple(value: BooleanInput) {
    this._multiple = coerceBooleanProperty(value);
    this._updateSelectionMode();
  }
  private _multiple: boolean = false;

  /** Whether the listbox is disabled. */
  @Input('cdkListboxDisabled')
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);
  }
  private _disabled: boolean = false;

  /** Whether the listbox will use active descendant or will move focus onto the options. */
  @Input('cdkListboxUseActiveDescendant')
  get useActiveDescendant(): boolean {
    return this._useActiveDescendant;
  }
  set useActiveDescendant(shouldUseActiveDescendant: BooleanInput) {
    this._useActiveDescendant = coerceBooleanProperty(shouldUseActiveDescendant);
  }
  private _useActiveDescendant: boolean = false;

  // TODO(mmalerba): Why do we have this? Shouldn't it depend on whether we're using active descendant?
  /** Whether on focus the listbox will focus its active option, default to true. */
  @Input('cdkListboxAutoFocus')
  get autoFocus(): boolean {
    return this._autoFocus;
  }
  set autoFocus(shouldAutoFocus: BooleanInput) {
    this._autoFocus = coerceBooleanProperty(shouldAutoFocus);
  }
  private _autoFocus: boolean = true;

  /** The orientation of the listbox. Only affects keyboard interaction, not visual layout. */
  @Input('cdkListboxOrientation') orientation: 'horizontal' | 'vertical' = 'vertical';

  // TODO(mmalerba): This is currently unused, do we need to do something with it?
  /** The function used to compare option values. */
  @Input('cdkListboxCompareWith') compareWith: (o1: T, o2: T) => boolean = (a1, a2) => a1 === a2;

  /** Emits when the selected value(s) in the listbox change. */
  @Output('cdkListboxValueChange') readonly valueChange = new Subject<ListboxValueChangeEvent<T>>();

  /** The child options in this listbox. */
  @ContentChildren(CdkOption, {descendants: true}) protected options: QueryList<CdkOption<T>>;

  /** The selection model used by the listbox. */
  protected selectionModelSubject = new BehaviorSubject(new SelectionModel<T>(this.multiple));

  /** The key manager that manages keyboard navigation for this listbox. */
  protected listKeyManager: ActiveDescendantKeyManager<CdkOption<T>>;

  /** Emits when the listbox is destroyed. */
  protected readonly destroyed = new Subject<void>();

  /** Emits when the internal value of the listbox changes for any reason. */
  _internalValueChange = this.selectionModelSubject.pipe(
    switchMap(selectionModel => selectionModel.changed),
    takeUntil(this.destroyed),
  );

  /** Callback called when the listbox has been touched */
  private _onTouched: () => void = () => {};

  /** Callback called when the listbox value changes */
  private _onChange: (value: T[]) => void = () => {};

  /** Emits when an option has been clicked. */
  private _optionClicked = defer(() =>
    (this.options.changes as Observable<CdkOption<T>[]>).pipe(
      startWith(this.options),
      switchMap(options => merge(...options.map(option => option._clicked.pipe(mapTo(option))))),
    ),
  );

  constructor(
    /** The host element of the listbox. */
    protected elementRef: ElementRef,
    // TODO(mmalerba): Should not depend on combobox
    @Optional() @Inject(CDK_COMBOBOX) private readonly _combobox: CdkCombobox,
    /** The directionality of the page. */
    @Optional() private readonly _dir?: Directionality,
  ) {}

  ngAfterContentInit() {
    this._initKeyManager();
    this._combobox?._registerContent(this.id, 'listbox');
    this._optionClicked
      .pipe(
        filter(option => !option.disabled),
        takeUntil(this.destroyed),
      )
      .subscribe(option => {
        this.listKeyManager.setActiveItem(option);
        this.triggerOption(option);
        this._updatePanelForSelection(option);
      });
  }

  ngOnDestroy() {
    this.listKeyManager.change.complete();
    this.destroyed.next();
    this.destroyed.complete();
  }

  /**
   * Toggle the selected state of the given option.
   * @param option The option to toggle
   */
  toggle(option: CdkOption<T> | T) {
    this.selectionModel().toggle(option instanceof CdkOption ? option.value : option);
  }

  /**
   * Select the given option.
   * @param option The option to select
   */
  select(option: CdkOption<T> | T) {
    this.selectionModel().select(option instanceof CdkOption ? option.value : option);
  }

  /**
   * Deselect the given option.
   * @param option The option to deselect
   */
  deselect(option: CdkOption<T> | T) {
    this.selectionModel().deselect(option instanceof CdkOption ? option.value : option);
  }

  /**
   * Set the selected state of all options.
   * @param isSelected The new selected state to set
   */
  setAllSelected(isSelected: boolean) {
    if (!isSelected) {
      this.selectionModel().clear();
    } else {
      this.selectionModel().select(...this.options.toArray().map(option => option.value));
    }
  }

  /**
   * Get whether the given option is selected.
   * @param option The option to get the selected state of
   */
  isSelected(option: CdkOption<T> | T) {
    return this.selectionModel().isSelected(option instanceof CdkOption ? option.value : option);
  }

  /**
   * Registers a callback to be invoked when the listbox's value changes from user input.
   * @param fn The callback to register
   * @docs-private
   */
  registerOnChange(fn: (value: T[]) => void): void {
    this._onChange = fn;
  }

  /**
   * Registers a callback to be invoked when the listbox is blurred by the user.
   * @param fn The callback to register
   * @docs-private
   */
  registerOnTouched(fn: () => {}): void {
    this._onTouched = fn;
  }

  /**
   * Sets the listbox's value.
   * @param value The new value of the listbox
   * @docs-private
   */
  writeValue(value: T[]): void {
    if (this.options) {
      this.selectionModel().setSelection(...(value == null ? [] : coerceArray(value)));
    }
  }

  /**
   * Sets the disabled state of the listbox.
   * @param isDisabled The new disabled state
   * @docs-private
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  /** The selection model used to track the listbox's value. */
  protected selectionModel() {
    return this.selectionModelSubject.value;
  }

  /**
   * Triggers the given option in response to user interaction.
   * - In single selection mode: selects the option and deselects any other selected option.
   * - In multi selection mode: toggles the selected state of the option.
   * @param option The option to trigger
   */
  protected triggerOption(option: CdkOption<T> | null) {
    if (option && !option.disabled) {
      let changed = false;
      const subscription = this.selectionModel().changed.subscribe(() => (changed = true));
      if (this.multiple) {
        this.toggle(option);
      } else {
        this.select(option);
      }
      subscription.unsubscribe();
      if (changed) {
        this._onChange(this.value);
        this.valueChange.next({
          value: this.value,
          listbox: this,
          option: option,
        });
      }
    }
  }

  /** Called when the listbox receives focus. */
  protected _handleFocus() {
    if (this.autoFocus) {
      this.listKeyManager.setActiveItem(this.listKeyManager.activeItem ?? this.options.first);
      this._focusActiveOption();
    }
  }

  /** Called when the user presses keydown on the listbox. */
  protected _handleKeydown(event: KeyboardEvent) {
    if (this._disabled) {
      return;
    }

    const {keyCode} = event;
    const previousActiveIndex = this.listKeyManager.activeItemIndex;

    if (keyCode === SPACE || keyCode === ENTER) {
      this.triggerOption(this.listKeyManager.activeItem);
      event.preventDefault();
    } else {
      this.listKeyManager.onKeydown(event);
    }

    /** Will select an option if shift was pressed while navigating to the option */
    const isArrow =
      keyCode === UP_ARROW ||
      keyCode === DOWN_ARROW ||
      keyCode === LEFT_ARROW ||
      keyCode === RIGHT_ARROW;
    if (isArrow && event.shiftKey && previousActiveIndex !== this.listKeyManager.activeItemIndex) {
      this.triggerOption(this.listKeyManager.activeItem);
    }
  }

  /**
   * Called when the focus leaves an element in the listbox.
   * @param event The focusout event
   */
  protected _handleFocusOut(event: FocusEvent) {
    const hostElement = this.elementRef.nativeElement;
    const otherElement = event.relatedTarget as Element;
    if (hostElement !== otherElement && !hostElement.contains(otherElement)) {
      this._onTouched();
    }
  }

  /** Get the id of the active option if active descendant is being used. */
  protected _getAriaActiveDescendant(): string | null | undefined {
    return this._useActiveDescendant ? this.listKeyManager?.activeItem?.id : null;
  }

  /** Initialize the key manager. */
  private _initKeyManager() {
    this.listKeyManager = new ActiveDescendantKeyManager(this.options)
      .withWrap()
      .withTypeAhead()
      .withHomeAndEnd()
      .withAllowedModifierKeys(['shiftKey']);

    if (this.orientation === 'vertical') {
      this.listKeyManager.withVerticalOrientation();
    } else {
      this.listKeyManager.withHorizontalOrientation(this._dir?.value || 'ltr');
    }

    this.listKeyManager.change
      .pipe(takeUntil(this.destroyed))
      .subscribe(() => this._focusActiveOption());
  }

  // TODO(mmalerba): Should not depend on combobox.
  private _updatePanelForSelection(option: CdkOption<T>) {
    if (this._combobox) {
      if (!this.multiple) {
        this._combobox.updateAndClose(option.isSelected() ? option.value : []);
      } else {
        this._combobox.updateAndClose(this.value);
      }
    }
  }

  /** Update the selection mode when the 'multiple' property changes. */
  private _updateSelectionMode() {
    if (this.multiple !== this.selectionModel().isMultipleSelection()) {
      let newSelection = this.value;
      // If we're changing to a single selection model and there are multiple items selected,
      // clear the selection rather than arbitrarily keeping one of the items selected.
      // TODO(mmalerba): Is this the right behavior?
      //  Maybe we should just leave an invalid value until the user does something to change it?
      if (!this.multiple && newSelection.length > 1) {
        newSelection = [];
        this._onChange(newSelection);
      }
      this.selectionModelSubject.next(new SelectionModel(this.multiple, newSelection));
    }
  }

  /** Focus the active option. */
  private _focusActiveOption() {
    if (!this.useActiveDescendant) {
      this.listKeyManager.activeItem?.focus();
    }
  }
}

/** Change event that is fired whenever the value of the listbox changes. */
export interface ListboxValueChangeEvent<T> {
  /** The new value of the listbox. */
  readonly value: T[];

  /** Reference to the listbox that emitted the event. */
  readonly listbox: CdkListbox<T>;

  /** Reference to the option that was triggered. */
  readonly option: CdkOption<T>;
}
