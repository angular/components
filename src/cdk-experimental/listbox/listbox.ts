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
  ElementRef,
  HostListener,
  Input,
  QueryList
} from '@angular/core';
import {ActiveDescendantKeyManager, Highlightable, ListKeyManagerOption} from "@angular/cdk/a11y";
import {ENTER, SPACE} from "@angular/cdk/keycodes";

@Directive({
  selector: '[cdkOption]',
  exportAs: 'cdkOption',
  host: {
    role: 'option',
    '[attr.aria-selected]': '_selected',
    '[attr.data-optionid]': '_optionId',
    '[attr.aria-disabled]': '_disabled'
  }
})
export class CdkOption implements ListKeyManagerOption, Highlightable {
  private _selected: boolean | null = null;
  private _optionId: string;
  private _disabled: boolean = false;
  private _tabindex: number | null = null;

  @Input()
  get selected(): boolean | null {
    return this._selected;
  }
  set selected(value: boolean | null) {
    this._selected = value;
  }

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = value;
    this._tabindex = value ? null : -1;
  }

  constructor(private el: ElementRef) {
  }

  setOptionId(id: string): void {
    this._optionId = id;
  }

  getOptionId(): string {
    return this._optionId;
  }

  getElementRef(): ElementRef {
    return this.el;
  }

  getLabel(): string {
    return this.el.nativeElement.textContent;
  }

  setActiveStyles() {
  }

  setInactiveStyles() {
  }
}

let _uniqueIdCounter = 0;

@Directive({
    selector: '[cdkListbox]',
    exportAs: 'cdkListbox',
    host: {
      role: 'listbox',
      '(keydown)': '_keydown($event)',
      '[attr.aria-disabled]': '_disabled'
    }
})
export class CdkListbox {

  _listKeyManager: ActiveDescendantKeyManager<CdkOption>;
  _activeOption: CdkOption; // TODO decide if user can just use _listKeyManager.activeItem
  _disabled: boolean = false;

  constructor(private el: ElementRef) {
  }

  @ContentChildren(CdkOption) _options: QueryList<CdkOption>;

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = value;
  }

  @HostListener('click', ['$event']) onClickUpdateSelectedOption($event: MouseEvent) {
    console.log('in listbox click event');
    console.log($event.target);
    this._options.toArray().forEach(option => {
      const optionId = option.getOptionId();
      if ($event.target instanceof Element && optionId === $event.target?.getAttribute('data-optionid')) {
        this.updateSelectedOption(option);
      }
    });
  }

  ngAfterContentInit() {
    this._options.forEach(option => {
      option.setOptionId(`cdk-option-${_uniqueIdCounter++}`);
    });

    this._listKeyManager = new ActiveDescendantKeyManager(this._options)
      .withWrap().withVerticalOrientation(true).withTypeAhead();

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
        const currentlyActiveOption = this._listKeyManager.activeItem;
        if (currentlyActiveOption && !currentlyActiveOption.disabled) {
          this.updateSelectedOption(currentlyActiveOption);
        }
        break;
      default:
        this._listKeyManager.onKeydown(event);
    }
  }

  private updateSelectedOption(option: CdkOption): void {
    if (option.selected) {
      this.deselectOption(option);
    } else {
      this.selectOption(option);
    }
  }

  selectOption(option: CdkOption): void {
    option.selected = true;
  }

  deselectOption(option: CdkOption): void {
    option.selected = null;
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
}
