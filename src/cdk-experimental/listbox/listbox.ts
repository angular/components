/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AfterContentInit,
  ContentChildren,
  Directive,
  ElementRef, EventEmitter, forwardRef,
  Inject,
  Input, OnDestroy, OnInit, Output,
  QueryList
} from '@angular/core';
import {ActiveDescendantKeyManager, Highlightable, ListKeyManagerOption} from '@angular/cdk/a11y';
import {END, ENTER, HOME, SPACE} from '@angular/cdk/keycodes';
import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';
import {SelectionChange, SelectionModel} from '@angular/cdk/collections';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

let nextId = 0;

@Directive({
  selector: '[cdkOption]',
  exportAs: 'cdkOption',
  host: {
    'role': 'option',
    '(click)': 'toggle()',
    '(focus)': 'activate()',
    '(blur)': 'deactivate()',
    '[id]': 'id',
    '[attr.aria-selected]': '_selected || null',
    '[attr.tabindex]': '_getTabIndex()',
    '[attr.aria-disabled]': '_isInteractionDisabled()',
    '[class.cdk-option-disabled]': '_isInteractionDisabled()',
    '[class.cdk-option-active]': '_active'
  }
})
export class CdkOption implements ListKeyManagerOption, Highlightable {
  private _selected: boolean = false;
  private _disabled: boolean = false;
  _active: boolean = false;

  @Input()
  get selected(): boolean {
    return this._selected;
  }
  set selected(value: boolean) {
    if (!this._disabled) {
      this._selected = coerceBooleanProperty(value);
    }
  }

  /** The id of the option, set to a uniqueid if the user does not provide one. */
  @Input() id = `cdk-option-${nextId++}`;

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
  }

  constructor(private readonly _elementRef: ElementRef,
              @Inject(forwardRef(() => CdkListbox)) readonly listbox: CdkListbox) {
  }

  /** Toggles the selected state, emits a change event through the injected listbox. */
  toggle() {
    if (!this._isInteractionDisabled()) {
      this.selected = !this.selected;
      this.listbox._emitChangeEvent(this);
      this.listbox._updateSelectionModel(this);
    }
  }

  toggleViaKeyboard() {
    if (!this._isInteractionDisabled()) {
      this.selected = !this.selected;
      this.listbox._emitChangeEvent(this);
    }
  }

  /** Sets the active property true if the option and listbox aren't disabled. */
  activate() {
    if (!this._isInteractionDisabled()) {
      this._active = true;
      this.listbox.setActiveOption(this);
    }
  }

  /** Sets the active property false. */
  deactivate() {
    this._active = false;
  }

  /** Applies focus to the option. */
  focus() {
    console.log('focusing option');
    this._elementRef.nativeElement.focus();
  }

  /** Returns true if the option or listbox are disabled, and false otherwise. */
  _isInteractionDisabled(): boolean {
    return (this.listbox.disabled || this._disabled);
  }

  /** Returns the tab index which depends on the disabled property. */
  _getTabIndex(): string | null {
    return this._isInteractionDisabled() ? null : '-1';
  }

  /** Get the label for this element which is required by the FocusableOption interface. */
  getLabel() {
    // we know that the current node is an element type
    const clone = this._elementRef.nativeElement.cloneNode(true) as Element;
    this._removeIcons(clone);

    return clone.textContent?.trim() || '';
  }

  /** Remove any child from the given element which can be identified as an icon. */
  private _removeIcons(element: Element) {
    for (let i = 0; i < element.children.length; i++) {
      const node = element.children[i];
      if (this._isIcon(node)) {
        element.removeChild(node);
      } else {
        this._removeIcons(node);
      }
    }
  }

  /** Return true if the element is deemed to be an icon type. */
  private _isIcon(element: Element) {
    return element.nodeName === 'MAT-ICON' || element.className === 'mat-icon';
  }

  setActiveStyles() {
    this._active = true;
  }

  setInactiveStyles() {
    this._active = false;
  }

  static ngAcceptInputType_selected: BooleanInput;
  static ngAcceptInputType_disabled: BooleanInput;
}

@Directive({
    selector: '[cdkListbox]',
    exportAs: 'cdkListbox',
    host: {
      'role': 'listbox',
      '(keydown)': '_keydown($event)',
      '[attr.aria-disabled]': '_disabled',
      '[attr.aria-multiselectable]': '_multiple',
      '[attr.aria-activedescendant]': '_getAriaActiveDescendant()'
    }
})
export class CdkListbox implements AfterContentInit, OnDestroy, OnInit {

  _listKeyManager: ActiveDescendantKeyManager<CdkOption>;
  _selectionModel: SelectionModel<CdkOption>;

  private _disabled: boolean = false;
  private _multiple: boolean = false;
  private _useActiveDescendant: boolean = true;
  private _activeOption: CdkOption;
  private readonly _destroy = new Subject<void>();

  @ContentChildren(CdkOption, {descendants: true}) _options: QueryList<CdkOption>;

  @Output() readonly selectionChange: EventEmitter<ListboxSelectionChangeEvent> =
      new EventEmitter<ListboxSelectionChangeEvent>();

  /** Whether the listbox allows multiple options to be selected. */
  @Input()
  get multiple(): boolean {
    return this._multiple;
  }
  set multiple(value: boolean) {
    if (this.multiple && !value) {
      this.setAllSelected(false);
    } else if (!this.multiple && value) {
      this._selectionModel = new SelectionModel<CdkOption>(value, this._selectionModel.selected);
    }
    this._multiple = coerceBooleanProperty(value);
  }

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
  }

  /** Whether the listbox will use active descendant or will move focus onto the options. */
  @Input()
  get useActiveDescendant(): boolean {
    return this._useActiveDescendant;
  }
  set useActiveDescendant(shouldUseActiveDescendant: boolean) {
    this._useActiveDescendant = shouldUseActiveDescendant;
  }

  ngOnInit() {
    this._selectionModel = new SelectionModel<CdkOption>(this.multiple);
  }

  ngAfterContentInit() {
    this._listKeyManager = new ActiveDescendantKeyManager(this._options)
      .withWrap().withVerticalOrientation().withTypeAhead();

    this._listKeyManager.change.subscribe(() => {
      this.updateActiveOption();
    });

    this._selectionModel.changed.pipe(takeUntil(this._destroy))
        .subscribe((event: SelectionChange<CdkOption>) => {

      event.added.forEach((option: CdkOption) => {
        option.selected = true;
      });

      event.removed.forEach((option: CdkOption) => {
        option.selected = false;
      });
    });
  }

  ngOnDestroy() {
    this._listKeyManager.change.complete();
    this._destroy.next();
    this._destroy.complete();
  }

  _keydown(event: KeyboardEvent) {
    if (this._disabled) {
      return;
    }

    const manager = this._listKeyManager;
    const {keyCode} = event;

    if (keyCode === HOME || keyCode === END) {
      event.preventDefault();
      keyCode === HOME ? manager.setFirstItemActive() : manager.setLastItemActive();

    } else if (keyCode === SPACE || keyCode === ENTER) {
      if (manager.activeItem && !manager.isTyping()) {
        this._toggleActiveOption();
      }

    } else {
      manager.onKeydown(event);
    }
  }

  /** Emits a selection change event, called when an option has its selected state changed. */
  _emitChangeEvent(option: CdkOption) {
    this.selectionChange.emit(new ListboxSelectionChangeEvent(this, option));
  }

  /**Updates the selection model after a toggle.
   * Deselects previously selected option if multiple is not enabled. */
  _updateSelectionModel(option: CdkOption) {
    if (!this.multiple && this._selectionModel.selected.length !== 0) {
      const previouslySelected = this._selectionModel.selected[0];
      this.deselect(previouslySelected);
    }

    option.selected ? this._selectionModel.select(option) :
                      this._selectionModel.deselect(option);
  }

  /** Toggles the selected state of the active option if not disabled. */
  private _toggleActiveOption() {
    const activeOption = this._listKeyManager.activeItem;
    if (activeOption && !activeOption.disabled) {
      activeOption.toggleViaKeyboard();
      this._updateSelectionModel(activeOption);
      this._emitChangeEvent(activeOption);
    }
  }

  /** Returns the id of the active option if active descendant is being used. */
  _getAriaActiveDescendant(): string | null {
    if (this._useActiveDescendant
        && this._listKeyManager && this._listKeyManager.activeItem) {
      return this._listKeyManager.activeItem.id;
    }

    return null;
  }

  /**Updates the activeOption variable and sets the active and
   * focus properties of the option. */
  updateActiveOption() {
    if (!this._listKeyManager.activeItem) {
      return;
    }

    const previouslyActive = this._activeOption;
    if (previouslyActive) {
      previouslyActive.deactivate();
    }

    this._activeOption = this._listKeyManager.activeItem;
    this._activeOption.activate();

    console.log('here in update active option');
    if (!this.useActiveDescendant) {
      this._activeOption.focus();
    }
  }

  /** Selects the given option if the option and listbox aren't disabled. */
  select(option: CdkOption) {
    if (!this.disabled && !option.disabled) {
      option.selected = true;
    }
  }

  /** Sets the selected state of all options to be the given value. */
  setAllSelected(isSelected: boolean) {
    this._options.forEach(option => {
      const wasSelected = option.selected;
      isSelected ? this.select(option) : this.deselect(option);

      if (wasSelected !== isSelected) {
        this._emitChangeEvent(option);
      }
    });
  }

  /** Deselects the given option if the option and listbox aren't disabled. */
  deselect(option: CdkOption) {
    if (!this.disabled && !option.disabled) {
      option.selected = false;
    }
  }

  /** Updates the key manager's active item to the given option. */
  setActiveOption(option: CdkOption) {
    this._listKeyManager.updateActiveItem(option);
  }

  static ngAcceptInputType_disabled: BooleanInput;
  static ngAcceptInputType_multiple: BooleanInput;

}

/** Change event that is being fired whenever the selected state of an option changes. */
export class ListboxSelectionChangeEvent {
  constructor(
      /** Reference to the listbox that emitted the event. */
      readonly source: CdkListbox,
      /** Reference to the option that has been changed. */
      readonly option: CdkOption) {}
}
