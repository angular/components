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
import {LEFT_ARROW, RIGHT_ARROW, ENTER, SPACE} from '../keyboard/keycodes';
import {coerceNumberProperty} from '../coercion/number-property';

/** Used to generate unique ID for each stepper component. */
let nextId = 0;

/** Change event emitted on selection changes. */
export class CdkStepperSelectionEvent {
  /** The index of the step that is newly selected during this change event. */
  newIndex: number;

  /** The index of the step that was previously selected. */
  oldIndex: number;

  /** The step component that is selected ruing this change event. */
  step: CdkStep;
}

@Directive({
  selector: 'cdk-stepper',
  host: {
    '(focus)': '_setStepfocused()',
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
  select(step: CdkStep | number): void {
    if (typeof step == 'number') {
      this.selectionChange.emit(this._createStepperSelectionEvent(step, this._selectedIndex));
    } else {
      let stepsArray = this._steps.toArray();
      this.selectionChange.emit(
          this._createStepperSelectionEvent(stepsArray.indexOf(step), this._selectedIndex));
    }
    this._setStepFocused(this._selectedIndex);
  }

  /** Selects and focuses the next step in list. */
  next(): void {
    if (this._selectedIndex == this._steps.length - 1) { return; }
    this.selectionChange.emit(
        this._createStepperSelectionEvent(this._selectedIndex + 1, this._selectedIndex));
    this._setStepFocused(this._selectedIndex);
  }

  /** Selects and focuses the previous step in list. */
  previous(): void {
    if (this._selectedIndex == 0) { return; }
    this.selectionChange.emit(
        this._createStepperSelectionEvent(this._selectedIndex - 1, this._selectedIndex));
    this._setStepFocused(this._selectedIndex);
  }

  /** Returns a unique id for each step label element. */
  _getStepLabelId(i: number): string {
    return `mat-step-label-${this._groupId}-${i}`;
  }

  /** Returns a unique id for each step content element. */
  _getStepContentId(i: number): string {
    return `mat-step-content-${this._groupId}-${i}`;
  }

  private _createStepperSelectionEvent(newIndex: number,
                                       oldIndex: number): CdkStepperSelectionEvent {
    this._selectedIndex = newIndex;
    const event = new CdkStepperSelectionEvent();
    event.newIndex = newIndex;
    event.oldIndex = oldIndex;
    event.step = this._steps.toArray()[this._selectedIndex];
    return event;
  }

  _onKeydown(event: KeyboardEvent) {
    switch (event.keyCode) {
      case RIGHT_ARROW:
        if (this._focusIndex != this._steps.length - 1) {
          this._setStepFocused(this._focusIndex + 1);
        }
        break;
      case LEFT_ARROW:
        if (this._focusIndex != 0) {
          this._setStepFocused(this._focusIndex - 1);
        }
        break;
      case SPACE:
      case ENTER:
        this._createStepperSelectionEvent(this._focusIndex, this._selectedIndex);
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  private _setStepFocused(index: number) {
    this._focusIndex = index;
    this._stepHeader.toArray()[this._focusIndex].nativeElement.focus();
  }
}
