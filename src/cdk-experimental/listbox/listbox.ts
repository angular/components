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

@Directive({
  selector: '[cdkOption]',
  exportAs: 'cdkOption',
  host: {
    role: 'option',
    '(click)': 'toggle()',
    '(focus)': 'activateOption()',
    '[attr.aria-selected]': '_selected || null',
    '[attr.id]': 'id',
    '[attr.aria-disabled]': '_comboDisabled',
    '[class.cdk-option-active]': '_active'
  }
})
export class CdkOption implements ListKeyManagerOption, Highlightable {
  private _selected: boolean = false;

  readonly _uniqueid: string;
  private _id: string;

  private _disabled: boolean = false;
  private _comboDisabled: boolean = this.listbox.disabled || this._disabled;

  private _tabindex: number | null = null;

  private _active: boolean = false;

  @Input()
  get selected(): boolean {
    return this._selected;
  }
  set selected(value: boolean) {
    this._selected = coerceBooleanProperty(value);
  }

  /** The id of the option, set to a uniqueid if the user does not provide one */
  @Input()
  get id(): string {
    return this._id;
  }
  set id(value: string) {
    this._id = value || this._uniqueid;
  }

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = value;
    this._tabindex = value ? null : -1;
  }

  constructor(private el: ElementRef,
              @Inject(forwardRef(() => CdkListbox)) public listbox: CdkListbox) {
    this._uniqueid = `cdk-option-${nextId++}`;
    this.id = this.id;
  }

  /** Toggles the selected state, emits a change event through the injected listbox */
  toggle() {
    this.selected = !this.selected;
    this.listbox._emitChangeEvent(this);
  }

  activateOption() {
    this.listbox.setActiveOption(this);
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

let nextId = 0;

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
  private _activeOption: CdkOption; // TODO decide if user can just use _listKeyManager.activeItem
  private _disabled: boolean = false;

  constructor(private el: ElementRef) {
  }

  @ContentChildren(CdkOption) _options: QueryList<CdkOption>;

  @Output() readonly selectionChange: EventEmitter<ListboxSelectionChangeEvent> =
      new EventEmitter<ListboxSelectionChangeEvent>();

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = value;
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

  _keydown(event: KeyboardEvent): void {
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

  private toggleActiveOption(): void {
    const currentActiveOption = this._listKeyManager.activeItem;
    if (currentActiveOption && !currentActiveOption.disabled) {
      currentActiveOption.toggle();
      this._emitChangeEvent(currentActiveOption);
    }
  }

  select(option: CdkOption) {
    option.selected = true;
  }

  deselect(option: CdkOption) {
    option.selected = false;
  }

  setActiveOption(option: CdkOption): void {
    this._listKeyManager.updateActiveItem(option);
  }

  setDisabledOption(isDisabled: boolean, option: CdkOption) {
    option.disabled = isDisabled;
    if (isDisabled) {
      this.deselect(option);
    }
  }

  setDisabledListbox(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  getSelectedOptions(): Array<CdkOption> {
    const selectedOptions = new Array<CdkOption>();
    this._options.toArray().forEach(option => {
      if (option.selected) {
        selectedOptions.push(option);
      }
    });

    return selectedOptions;
  }

  getElementRef(): ElementRef {
    return this.el;
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
