/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ContentChildren,
  Directive,
  ElementRef, EventEmitter, forwardRef,
  Inject,
  Input, Output,
  QueryList
} from '@angular/core';
import {ActiveDescendantKeyManager, Highlightable, ListKeyManagerOption} from '@angular/cdk/a11y';
import {ENTER, SPACE} from '@angular/cdk/keycodes';
import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';

let nextId = 0;

@Directive({
  selector: '[cdkOption]',
  exportAs: 'cdkOption',
  host: {
    role: 'option',
    '(click)': 'toggle()',
    '(focus)': 'activateOption()',
    '(blur)': 'deactivateOption()',
    '[attr.aria-selected]': '_selected || null',
    '[id]': 'id',
    '[attr.tabindex]': '_getTabIndex()',
    '[attr.aria-disabled]': '_getComboDisabled()',
    '[class.cdk-option-disabled]': '_getComboDisabled()',
    '[class.cdk-option-active]': '_active'

  }
})
export class CdkOption implements ListKeyManagerOption, Highlightable {
  private _selected: boolean = false;
  private _disabled: boolean = false;
  private _active: boolean = false;

  @Input()
  get selected(): boolean {
    return this._selected;
  }
  set selected(value: boolean) {
    if (!this._disabled) {
      this._selected = coerceBooleanProperty(value);
    }
  }

  /** The id of the option, set to a uniqueid if the user does not provide one */
  @Input() id = `cdk-option-${nextId++}`;

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
  }

  constructor(private el: ElementRef,
              @Inject(forwardRef(() => CdkListbox)) public listbox: CdkListbox) {
  }

  /** Toggles the selected state, emits a change event through the injected listbox */
  toggle() {
    if (!this._getComboDisabled()) {
      this.selected = !this.selected;
      this.listbox._emitChangeEvent(this);
    }
  }

  activateOption() {
    if (!this._getComboDisabled()) {
      this._active = true;
      this.listbox.setActiveOption(this);
    }
  }

  deactivateOption() {
    this._active = false;
  }

  _getComboDisabled(): boolean {
    return (this.listbox.disabled || this._disabled);
  }

  _getTabIndex(): string | null {
    return (this.listbox.disabled || this._disabled) ? null : '-1';
  }

  getLabel(): string {
    return this.el.nativeElement.textContent;
  }

  setActiveStyles() {
    this._active = true;
  }

  setInactiveStyles() {
    this._active = false;
  }

  static ngAcceptInputType_selected: BooleanInput;
}

@Directive({
    selector: '[cdkListbox]',
    exportAs: 'cdkListbox',
    host: {
      role: 'listbox',
      '(keydown)': '_keydown($event)',
      '[attr.aria-disabled]': '_disabled',
    }
})
export class CdkListbox {

  _listKeyManager: ActiveDescendantKeyManager<CdkOption>;
  private _activeOption: CdkOption;
  private _disabled: boolean = false;

  @ContentChildren(CdkOption) _options: QueryList<CdkOption>;

  @Output() readonly selectionChange: EventEmitter<ListboxSelectionChangeEvent> =
      new EventEmitter<ListboxSelectionChangeEvent>();

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
  }

  ngAfterContentInit() {
    this._listKeyManager = new ActiveDescendantKeyManager(this._options)
      .withWrap().withVerticalOrientation().withTypeAhead();

    this._listKeyManager.change.subscribe(() => {
      if (this._listKeyManager.activeItem) {
        this._activeOption = this._listKeyManager.activeItem;
      }
    });
  }

  ngOnDestroy() {
    this._listKeyManager.change.complete();
  }

  _keydown(event: KeyboardEvent) {
    if (this._disabled) {
      return;
    }

    const keyCode = event.keyCode;

    switch (keyCode) {
      case SPACE:
      case ENTER:
        if (this._listKeyManager.activeItem && !this._listKeyManager.isTyping()) {
          this.toggleActiveOption();
        }
        break;
      default:
        this._listKeyManager.onKeydown(event);
    }
  }

  /** Emits a selection change event, called when an option has its selected state changed */
  _emitChangeEvent(option: CdkOption) {
    this.selectionChange.emit(new ListboxSelectionChangeEvent(this, option));
  }

  private toggleActiveOption() {
    const currentActiveOption = this._listKeyManager.activeItem;
    if (currentActiveOption && !currentActiveOption.disabled) {
      currentActiveOption.toggle();
      this._emitChangeEvent(currentActiveOption);
    }
  }

  select(option: CdkOption) {
    if (!this.disabled && option.disabled) {
      option.selected = true;
    }
  }

  deselect(option: CdkOption) {
    if (!this.disabled && option.disabled) {
      option.selected = false;
    }
  }

  setActiveOption(option: CdkOption) {
    this._listKeyManager.updateActiveItem(option);
  }

  setDisabledOption(isDisabled: boolean, option: CdkOption) {
    option.disabled = isDisabled;
  }
}

/** Change event that is being fired whenever the selected state of an option changes. */
export class ListboxSelectionChangeEvent {
  constructor(
      /** Reference to the listbox that emitted the event. */
      public source: CdkListbox,
      /** Reference to the option that has been changed. */
      public option: CdkOption) {}
}
