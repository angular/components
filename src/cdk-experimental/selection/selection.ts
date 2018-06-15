/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, EventEmitter, OnInit, Input, ElementRef, Output} from '@angular/core';
import {SelectionChange, SelectionModel, compareFn} from '@angular/cdk/collections';
import {coerceBooleanProperty, coerceNumberProperty} from '@angular/cdk/coercion';


@Directive({
  selector: '[cdkSelection]'
})
export class CdkSelection<T> implements OnInit {

  /** List of all active selections. */
  @Input('cdkSelection') selectedItems: T[] = [];

  /**
   * Different selection modes to apply.
   * - Single: Only one item can be selected at a time.
   * - Multiple: Multiple items can be selected.
   */
  @Input('cdkSelectionMode') mode: 'single' | 'multiple' = 'single';

  /** When multi select is enabled, require a key modifier to select multiples. */
  @Input('cdkSelectRequireModifier') requireModifier: boolean = false;

  /** Track by used for selection matching. */
  @Input('cdkSelectionTrackBy') trackBy: (model: T) => any;

  /** Whether the selections can be cleared after selection. */
  @Input('cdkSelectionDeselectable')
  get deselectable(): boolean { return this._deselectable; }
  set deselectable(val) { this._deselectable = coerceBooleanProperty(val); }
  private _deselectable: boolean = true;

  /** The max number of selections that can be selected */
  @Input('cdkSelectionMaxSelected')
  get maxSelections(): number { return this._maxSelections; }
  set maxSelections(val) {
    if (val !== undefined && val !== null) {
      this._maxSelections = coerceNumberProperty(val);
    }
  }
  private _maxSelections: number;

  /** Whether the control is disabled or not. */
  @Input('cdkSelectionDisabled')
  get disabled(): boolean { return this._disabled; }
  set disabled(val) { this._disabled = coerceBooleanProperty(val); }
  private _disabled: boolean;

  /** Event fired when a selection/deselection occurs. */
  @Output() selectionChange = new EventEmitter<SelectionChange<T>>();

  /** The model backing of the component. */
  _selectionModel: SelectionModel<T>;

  /** Set of registered toggle components. */
  _toggleDirectives: any[] = [];

  /** Previously selected index used for range selection. */
  _previousSelectedIndex = -1;

  constructor(private _elementRef: ElementRef) {}

  ngOnInit() {
    this. _selectionModel = new SelectionModel<T>(
      this.mode === 'multiple',
      this.selectedItems,
      true,
      this.trackBy
    );

    if (this._selectionModel.change) {
      this._selectionModel.change.subscribe(e => {
        this.selectedItems = this._selectionModel.selected;
        this.selectionChange.emit(e);
      });
    }
  }

  /** Register the toggle directive. */
  registerToggle(toggle) {
    this._toggleDirectives.push(toggle);
  }

  /** Deregister the toggle directivet. */
  deregisterToggle(toggle) {
    const toggleIndex = this._toggleDirectives.indexOf(toggle);
    if (toggleIndex > -1) {
      this._toggleDirectives.splice(toggleIndex, 1);
    }
  }

  /** Toggle the selection of a item. */
  toggle(toggle) {
    if (this.disabled) {
      return;
    }

    if (Array.isArray(toggle.model)) {
      if (this.mode === 'multiple' &&
          (this.maxSelections === undefined ||
          (toggle.model.length + this._selectionModel.selected.length) < this.maxSelections)) {
        this._selectionModel.clear();
        this._selectionModel.toggle(...toggle.model);
      }
    } else {

      this._setSelections(toggle);
    }
  }

  /** Set the user selection for the element. */
  setTextSelection(type: string) {
    const elm = this._elementRef.nativeElement;
    elm.style.userSelect = type;
    elm.style.webkitUserSelect = type;
    elm.style.MozUserSelect = type;
  }

  /** Set the selection state given a toggle directive and its activated options. */
  private _setSelections(toggle) {
    const ctrls = this._getSortedSet();
    const index = this._getToggleIndex(ctrls, toggle);
    const { modifier, model } = toggle;
    const selections = this._selectionModel.selected;

    if (this.mode === 'multiple' && modifier === 'shift') {
      if (index > -1) {
        this._selectRange(ctrls, this._previousSelectedIndex, index);
      }
    } else if (this.mode === 'multiple') {
      const isSelected = this._selectionModel.isSelected(model);
      if (this.requireModifier && modifier !== 'meta') {
        this._selectionModel.clear();
        if (!isSelected || !this.deselectable) {
          this._selectionModel.select(model);
        }
      } else {
        if (!isSelected) {
          if (this.maxSelections === undefined || selections.length < this.maxSelections) {
            this._selectionModel.select(model);
          }
        } else if (this.deselectable || (!this.deselectable && selections.length > 1)) {
          this._selectionModel.deselect(model);
        }
      }
    } else {
      const isSelected = this._selectionModel.isSelected(model);
      if (!isSelected) {
        this._selectionModel.select(model);
      } else if(this.deselectable) {
        this._selectionModel.deselect(model);
      }
    }

    this._previousSelectedIndex = index;
  }

  /** Selects a collection of values between two indexes. */
  private _selectRange(ctrls: any[], sourceIndex: number, targetIndex: number) {
    const selections = this._selectionModel.selected;

    // On init we don't have a previous index, find it based on the first selection
    if (sourceIndex === undefined && selections.length) {
      const [selection] = selections;
      const idx = ctrls.findIndex(sel => compareFn(this.trackBy, sel.model, selection));
      sourceIndex = idx;
    }

    const reverse = targetIndex < sourceIndex;
    const start = reverse ? targetIndex : sourceIndex;
    const end = reverse ? sourceIndex : targetIndex;
    const result: any[] = [];

    for (let i = start; i <= end; i++) {
      const ctrl = ctrls[i];
      if (!ctrl.disabled) {
        result.push(ctrl.model);
      }
    }

    if (this.maxSelections === undefined ||
        (result.length + selections.length) < this.maxSelections) {
      this._selectionModel.select(...result);
    }
  }

  /** Get the index of the given element in the dom tree relative to the other toggles. */
  private _getToggleIndex(sortedSet: any[], sourceCtrl: any) {
    let idx = 0;
    let foundIdx = -1;

    for (const ctrl of sortedSet) {
      if (ctrl.elementRef.nativeElement === sourceCtrl.elementRef.nativeElement) {
        foundIdx = idx;
        break;
      }
      idx++;
    }

    return foundIdx;
  }

  /** Get the set of controls sorted by DOM order. */
  private _getSortedSet(): any[] {
    const elements = this._getElements();
    return [...this._toggleDirectives].sort((a, b) =>
      elements.indexOf(a.elementRef.nativeElement) - elements.indexOf(b.elementRef.nativeElement));
  }

  /** Get all the child toggle elements. */
  private _getElements(): HTMLElement[] {
    return [].slice.call(this._elementRef.nativeElement.querySelectorAll('[cdkSelectionToggle]'));
  }

}
