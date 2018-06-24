/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Input, OnInit, OnDestroy, ElementRef, ChangeDetectorRef} from '@angular/core';
import {CdkSelection} from './selection';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {coerceBooleanProperty} from '@angular/cdk/coercion';


@Directive({
  selector: '[cdkSelectionToggle]',
  host: {
    'class': 'cdk-selection-toggle',
    'tabindex': '-1',
    '[class.cdk-selection-selected]': 'selected',
    '(mousedown)': '_setModifiers($event)',
    '(click)': '_toggle()',
    /** Right click should select item. */
    '(contextmenu)': '_toggle()',
    '(keydown.enter)': '_toggle()',
    '(keydown.shift)': '_disableTextSelection()',
    '(blur)': '_enableTextSelection()',
  }
})
export class CdkSelectionToggle<T> implements OnInit, OnDestroy {

  /** The value(s) that represent the selection of this directive. */
  @Input('cdkSelectionToggle') model: T | T[];

  /** Whether the selection is disabled or not. */
  @Input()
  get disabled(): boolean { return this._disabled; }
  set disabled(val) { this._disabled = coerceBooleanProperty(val); }
  private _disabled: boolean;

  /** Whether the toggle is selected. */
  selected: boolean;

  /** The modifier that was invoked. */
  modifier: 'shift' | 'meta' | null;

  private _destroyed = new Subject();

  constructor(
    /** @docs-private */
    public elementRef: ElementRef,
    private _selection: CdkSelection<T>,
    private _changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this._selection.selectionChange
      .pipe(takeUntil(this._destroyed))
      .subscribe(() => this._updateSelected());

    this._updateSelected();
    this._selection.registerToggle(this);
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();

    this._selection.deregisterToggle(this);
  }

  /** Invoke toggle on the parent selection directive. */
  _toggle() {
    if (!this.disabled) {
      this._selection.toggle(this);
    }
  }

  /** Set the modifiers for the mouse event. */
  _setModifiers(event) {
    if (event.metaKey || event.ctrlKey) {
      this.modifier = 'meta';
    } else if (event.shiftKey) {
      this.modifier = 'shift';
    }

    // Clear the modifier if we don't use it
    setTimeout(() => this.modifier = null, 200);
  }

  /** Update the state of the selection based on the selection model. */
  _updateSelected() {
    if (Array.isArray(this.model)) {
      let has = true;
      for (const model of this.model) {
        if (!this._selection._selectionModel.isSelected(model)) {
          has = false;
          break;
        }
      }
      this.selected = has;
    } else {
      this.selected = this._selection._selectionModel.isSelected(this.model);
    }

    this._changeDetectorRef.markForCheck();
  }

  /** Shift key was captured to set user selection. */
  _disableTextSelection() {
    this._selection.setTextSelection('none');
  }

  /** Element was blurred, lets reset user selection. */
  _enableTextSelection() {
    setTimeout(() => this._selection.setTextSelection('initial'), 200);
  }

}
