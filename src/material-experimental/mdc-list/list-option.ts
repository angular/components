/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';
import {Platform} from '@angular/cdk/platform';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {MatLine, ThemePalette} from '@angular/material/core';
import {MatListAvatarCssMatStyler, MatListIconCssMatStyler} from './list';
import {MatListItemBase} from './list-base';
import {MAT_LIST_OPTION, MatSelectionList} from './selection-list';

/** Unique id for created list options. */
let uniqueId = 0;

@Component({
  selector: 'mat-list-option',
  exportAs: 'matListOption',
  styleUrls: ['list-option.css'],
  host: {
    'class': 'mat-mdc-list-item mat-mdc-list-option mdc-list-item',
    'role': 'option',
    // As per MDC, only list items in single selection mode should receive the `--selected`
    // class. For multi selection, the checkbox is used as indicator.
    '[class.mdc-list-item--selected]': 'selected && !selectionList.multiple',
    '[class.mat-mdc-list-item-with-avatar]': '_hasIconOrAvatar()',
    '[class.mat-accent]': 'color !== "primary" && color !== "warn"',
    '[class.mat-warn]': 'color === "warn"',
    '(blur)': '_handleBlur()',
  },
  templateUrl: 'list-option.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {provide: MAT_LIST_OPTION, useExisting: MatListOption},
    {provide: MatListItemBase, useExisting: MatListOption},
  ]
})
export class MatListOption extends MatListItemBase implements OnInit, OnDestroy {
  /**
   * This is set to true after the first OnChanges cycle so we don't
   * clear the value of `selected` in the first cycle.
   */
  private _inputsInitialized = false;

  @ViewChild('text') _itemText: ElementRef<HTMLElement>;
  @ContentChildren(MatLine, {read: ElementRef, descendants: true}) lines:
    QueryList<ElementRef<Element>>;

  @ContentChildren(MatListAvatarCssMatStyler, {descendants: false}) _avatars: QueryList<never>;
  @ContentChildren(MatListIconCssMatStyler, {descendants: false}) _icons: QueryList<never>;

  /** Unique id for the text. Used for describing the underlying checkbox input. */
  _optionTextId: string = `mat-mdc-list-option-text-${uniqueId++}`;

  /** Whether the label should appear before or after the checkbox. Defaults to 'after' */
  @Input() checkboxPosition: 'before' | 'after' = 'after';

  /** Theme color of the list option. This sets the color of the checkbox. */
  @Input()
  get color(): ThemePalette { return this._color || this.selectionList.color; }
  set color(newValue: ThemePalette) { this._color = newValue; }
  private _color: ThemePalette;

  /** Value of the option */
  @Input()
  get value(): any { return this._value; }
  set value(newValue: any) {
    if (this.selected && newValue !== this.value && this._inputsInitialized) {
      this.selected = false;
    }

    this._value = newValue;
  }
  private _value: any;

  /** Whether the option is selected. */
  @Input()
  get selected(): boolean { return this.selectionList.selectedOptions.isSelected(this); }
  set selected(value: boolean) {
    const isSelected = coerceBooleanProperty(value);

    if (isSelected !== this._selected) {
      this._setSelected(isSelected);
      this.selectionList._reportValueChange();
    }
  }
  private _selected = false;

  constructor(
      element: ElementRef,
      ngZone: NgZone,
      platform: Platform,
      public selectionList: MatSelectionList,
      private _changeDetectorRef: ChangeDetectorRef) {
    super(element, ngZone, selectionList, platform);

    // By default, we mark all options as unselected. The MDC list foundation will
    // automatically update the attribute based on selection. Note that we need to
    // initially set this because MDC does not set the default attributes for list
    // items but expects items to be set up properly in the static markup.
    element.nativeElement.setAttribute('aria-selected', 'false');
  }

  ngOnInit() {
    const list = this.selectionList;

    if (list._value && list._value.some(value => list.compareWith(value, this._value))) {
      this._setSelected(true);
    }

    const wasSelected = this._selected;

    // List options that are selected at initialization can't be reported properly to the form
    // control. This is because it takes some time until the selection-list knows about all
    // available options. Also it can happen that the ControlValueAccessor has an initial value
    // that should be used instead. Deferring the value change report to the next tick ensures
    // that the form control value is not being overwritten.
    Promise.resolve().then(() => {
      if (this._selected || wasSelected) {
        this.selected = true;
        this._changeDetectorRef.markForCheck();
      }
    });
    this._inputsInitialized = true;
  }

  ngOnDestroy(): void {
    if (this.selected) {
      // We have to delay this until the next tick in order
      // to avoid changed after checked errors.
      Promise.resolve().then(() => {
        this.selected = false;
      });
    }
  }

  /** Toggles the selection state of the option. */
  toggle(): void {
    this.selected = !this.selected;
  }

  /** Allows for programmatic focusing of the option. */
  focus(): void {
    this._elementRef.nativeElement.focus();
  }

  _isReversed(): boolean {
    return this.checkboxPosition === 'after';
  }

  /** Whether the list-option has a checkbox. */
  _hasCheckbox() {
    return this.selectionList.multiple;
  }

  /** Whether the list-option has icons or avatars. */
  _hasIconOrAvatar() {
    return this._avatars.length || this._icons.length;
  }

  _handleBlur() {
    this.selectionList._onTouched();
  }

  /**
   * Sets the selected state of the option.
   * @returns Whether the value has changed.
   */
  _setSelected(selected: boolean): boolean {
    if (selected === this._selected) {
      return false;
    }

    this._selected = selected;

    if (selected) {
      this.selectionList.selectedOptions.select(this);
    } else {
      this.selectionList.selectedOptions.deselect(this);
    }

    this._changeDetectorRef.markForCheck();
    return true;
  }

  /**
   * Notifies Angular that the option needs to be checked in the next change detection run.
   * Mainly used to trigger an update of the list option if the disabled state of the selection
   * list changed.
   */
  _markForCheck() {
    this._changeDetectorRef.markForCheck();
  }

  static ngAcceptInputType_selected: BooleanInput;
}
