/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
  Directive,
  ViewChildren,
  // tslint doesn't recognize `ElementRef` is used since it's only used as a generic.
  // tslint:disable-next-line
  ElementRef
} from '@angular/core';
import {CdkStep} from './step';
import {LEFT_ARROW, RIGHT_ARROW, ENTER, TAB} from '../keyboard/keycodes';
import {coerceNumberProperty} from '../coercion/number-property';

/** Used to generate unique ID for each stepper component. */
let nextId = 0;

/** Change event emitted on selection changes. */
export class CdkStepperSelectionEvent {
  index: number;
  step: CdkStep;
}

@Directive({
  selector: '[cdkStepper]',
  host: {
    '(focus)': '_setStepfocus()',
    '(keydown)': '_onKeydown($event)',
  },
})
export class CdkStepper {
  /** The list of step components that the stepper is holding. */
  @ContentChildren(CdkStep) _steps: QueryList<CdkStep>;

  /** The list of step headers of the steps in the stepper. */
  @ViewChildren('stepHeader') _stepHeader: QueryList<ElementRef>;

  /** The index of the currently selected step. */
  @Input()
  get selectedIndex() { return this._selectedIndex; }
  set selectedIndex(value: any) {
    this._selectedIndex = coerceNumberProperty(value);
  }
  private _selectedIndex: number;

  /** Event emitted when the selected step has changed. */
  @Output() selectionChange = new EventEmitter<CdkStepperSelectionEvent>();

  /** The index of the step that the focus is currently on. */
  _focusIndex: number = 0;

  private _groupId: number;

  constructor() {
    this._groupId = nextId++;
  }

  /** Selects and focuses the provided step. */
  select(step: CdkStep): void {
    let stepsArray = this._steps.toArray();
    this._selectedIndex = stepsArray.indexOf(step);
    this.selectionChange.emit(this._createStepperSelectionEvent(this._selectedIndex));
    this._focusIndex = this._selectedIndex;
    this._setStepFocus();
  }

  /** Selects and focuses the next step in list. */
  next(): void {
    if (this._selectedIndex == this._steps.length - 1) { return; }
    this._selectedIndex++;
    this.selectionChange.emit(this._createStepperSelectionEvent(this._selectedIndex));
    this._focusIndex = this._selectedIndex;
    this._setStepFocus();
  }

  /** Selects and focuses the previous step in list. */
  previous(): void {
    if (this._selectedIndex == 0) { return; }
    this._selectedIndex--;
    this.selectionChange.emit(this._createStepperSelectionEvent(this._selectedIndex));
    this._focusIndex = this._selectedIndex;
    this._setStepFocus();
  }

  /** Returns a unique id for each step label element. */
  _getStepLabelId(i: number): string {
    return `mat-step-label-${this._groupId}-${i}`;
  }

  /** Returns a unique id for each step content element. */
  _getStepContentId(i: number): string {
    return `mat-step-content-${this._groupId}-${i}`;
  }

  private _createStepperSelectionEvent(index: number): CdkStepperSelectionEvent {
    const event = new CdkStepperSelectionEvent();
    event.index = index;
    event.step = this._steps.toArray()[this._selectedIndex];
    return event;
  }

  _onKeydown(event: KeyboardEvent) {
    switch (event.keyCode) {
      case RIGHT_ARROW:
        if (this._focusIndex != this._steps.length - 1) {
          this._focusIndex++;
          this._setStepFocus();
        }
        break;
      case LEFT_ARROW:
        if (this._focusIndex != 0) {
          this._focusIndex--;
          this._setStepFocus();
        }
        break;
      case ENTER:
        this._selectedIndex = this._focusIndex;
        this._createStepperSelectionEvent(this._selectedIndex);
        break;
    }
    if (event.keyCode != TAB) {
      event.preventDefault();
    }
  }

  private _setStepFocus() {
    this._stepHeader.toArray()[this._focusIndex].nativeElement.focus();
  }
}
