/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {coerceNumberProperty, NumberInput} from '@angular/cdk/coercion';
import {Directive, Input, OnDestroy, OnInit, inject} from '@angular/core';
import {NG_VALUE_ACCESSOR} from '@angular/forms';
import {Observable, of as observableOf, Subject} from 'rxjs';
import {distinctUntilChanged, switchMap, takeUntil} from 'rxjs/operators';

import {CdkSelection} from './selection';

/**
 * Makes the element a selection toggle.
 *
 * Must be used within a parent `CdkSelection` directive.
 * Must be provided with the value. If `trackBy` is used on `CdkSelection`, the index of the value
 * is required. If the element implements `ControlValueAccessor`, e.g. `MatCheckbox`, the directive
 * automatically connects it with the selection state provided by the `CdkSelection` directive. If
 * not, use `checked$` to get the checked state of the value, and `toggle()` to change the selection
 * state.
 */
@Directive({
  selector: '[cdkSelectionToggle]',
  exportAs: 'cdkSelectionToggle',
  standalone: true,
})
export class CdkSelectionToggle<T> implements OnDestroy, OnInit {
  private _selection = inject<CdkSelection<T>>(CdkSelection, {optional: true})!;
  private _controlValueAccessors = inject(NG_VALUE_ACCESSOR, {optional: true, self: true});

  /** The value that is associated with the toggle */
  @Input('cdkSelectionToggleValue') value: T;

  /** The index of the value in the list. Required when used with `trackBy` */
  @Input('cdkSelectionToggleIndex')
  get index(): number | undefined {
    return this._index;
  }
  set index(index: NumberInput) {
    this._index = coerceNumberProperty(index);
  }
  protected _index?: number;

  /** The checked state of the selection toggle */
  readonly checked: Observable<boolean>;

  /** Toggles the selection */
  toggle() {
    this._selection.toggleSelection(this.value, this.index);
  }

  private _destroyed = new Subject<void>();

  constructor() {
    const _selection = this._selection;

    this.checked = _selection.change.pipe(
      switchMap(() => observableOf(this._isSelected())),
      distinctUntilChanged(),
    );
  }

  ngOnInit() {
    this._assertValidParentSelection();
    this._configureControlValueAccessor();
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  private _assertValidParentSelection() {
    if (!this._selection && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw Error('CdkSelectAll: missing CdkSelection in the parent');
    }
  }

  private _configureControlValueAccessor() {
    if (this._controlValueAccessors && this._controlValueAccessors.length) {
      this._controlValueAccessors[0].registerOnChange((e: unknown) => {
        if (typeof e === 'boolean') {
          this.toggle();
        }
      });

      this.checked.pipe(takeUntil(this._destroyed)).subscribe(state => {
        this._controlValueAccessors![0].writeValue(state);
      });
    }
  }

  private _isSelected(): boolean {
    return this._selection.isSelected(this.value, this.index);
  }
}
