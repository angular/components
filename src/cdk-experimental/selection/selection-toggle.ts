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


@Directive({
  selector: '[cdkSelectionToggle]',
  host: {
    'class': 'cdk-selection-toggle',
    'role': 'option',
    'tabindex': '-1',
    '[attr.aria-selected]': 'selected',
    '[class.cdk-selection-selected]': 'selected',
    '(mousedown)': '_onMouseDown($event)',
    '(click)': '_onToggle()',
    '(contextmenu)': '_onToggle()',
    '(keydown.enter)': '_onToggle()',
  }
})
export class CdkSelectionToggle<T> implements OnInit, OnDestroy {

  /** Model of the item to toggle selection. */
  @Input('cdkSelectionToggle') model: T | T[];

  /** Whether the selection is disabled or not. */
  @Input() disabled: boolean;

  /** Whether the toggle is selected or not. */
  selected: boolean;

  /** The modifier that was invoked. */
  modifier: 'shift' | 'meta' | null;

  private _destroy = new Subject();

  constructor(
    public elementRef: ElementRef,
    private _selection: CdkSelection<T>,
    private _cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this._selection.selectionChange
      .pipe(takeUntil(this._destroy))
      .subscribe(() => this._checkSelected());

    this._checkSelected();
    this._selection.register(this);
  }

  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();

    this._selection.deregister(this);
  }

  /** Mousedown even to capture modifiers. */
  _onMouseDown(event: MouseEvent) {
    this._setModifiers(event);
  }

  /** Invoke toggle on the parent selection directive. */
  _onToggle() {
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

  /** Check whether the toggle's model(s) are selected and set state. */
  _checkSelected() {
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

    this._cd.markForCheck();
  }

}
