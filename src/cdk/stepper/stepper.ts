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
  // This import is only used to define a generic type. The current TypeScript version incorrectly
  // considers such imports as unused (https://github.com/Microsoft/TypeScript/issues/14953)
  // tslint:disable-next-line:no-unused-variable
  ElementRef,
  Component,
  ContentChild,
  ViewChild,
  TemplateRef
} from '@angular/core';
import {LEFT_ARROW, RIGHT_ARROW, ENTER, SPACE} from '../keyboard/keycodes';
import {CdkStepLabel} from './step-label';

/** Used to generate unique ID for each stepper component. */
let nextId = 0;

/** Change event emitted on selection changes. */
export class CdkStepperSelectionEvent {
  /** The index of the step that is newly selected during this change event. */
  newIndex: number;

  /** The index of the step that was previously selected. */
  oldIndex: number;

  /** The new step component that is selected ruing this change event. */
  newStep: CdkStep;

  /** The step component that was previously selected. */
  oldStep: CdkStep;
}

@Component({
  selector: 'cdk-step',
  templateUrl: 'step.html',
})
export class CdkStep {
  /** Template for step label if it exists. */
  @ContentChild(CdkStepLabel) stepLabel: CdkStepLabel;

  /** Template for step content. */
  @ViewChild(TemplateRef) content: TemplateRef<any>;

  /** Label of the step. */
  @Input()
  label: string;

  constructor(private _stepper: CdkStepper) { }

  /** Selects this step component. */
  select(): void {
    this._stepper.selected = this;
  }
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

  /** The index of the selected step. */
  get selectedIndex() { return this._selectedIndex; }
  set selectedIndex(index: number) {
    if (this._selectedIndex == index) { return; }
    this._emitStepperSelectionEvent(index);
    this._setStepFocused(this._selectedIndex);
  }
  private _selectedIndex: number = 0;

  /** Returns the step that is selected. */
  get selected() { return this._steps[this.selectedIndex]; }
  /** Sets selectedIndex as the index of the provided step. */
  set selected(step: CdkStep) {
    let index = this._steps.toArray().indexOf(step);
    this.selectedIndex = index;
  }

  /** Event emitted when the selected step has changed. */
  @Output() selectionChange = new EventEmitter<CdkStepperSelectionEvent>();

  /** The index of the step that the focus can be set. */
  _focusIndex: number = 0;

  /** Used to track unique ID for each stepper component. */
  private _groupId: number;

  constructor() {
    this._groupId = nextId++;
  }

  /** Selects and focuses the next step in list. */
  next(): void {
    if (this._selectedIndex == this._steps.length - 1) { return; }
    this.selectedIndex++;
  }

  /** Selects and focuses the previous step in list. */
  previous(): void {
    if (this._selectedIndex == 0) { return; }
    this.selectedIndex--;
  }

  /** Returns a unique id for each step label element. */
  _getStepLabelId(i: number): string {
    return `mat-step-label-${this._groupId}-${i}`;
  }

  /** Returns nique id for each step content element. */
  _getStepContentId(i: number): string {
    return `mat-step-content-${this._groupId}-${i}`;
  }

  private _emitStepperSelectionEvent(newIndex: number): void {
    const event = new CdkStepperSelectionEvent();
    event.oldIndex = this._selectedIndex;
    event.newIndex = newIndex;
    let stepsArray = this._steps.toArray();
    event.oldStep = stepsArray[this._selectedIndex];
    event.newStep = stepsArray[newIndex];
    this._selectedIndex = newIndex;
    this.selectionChange.emit(event);
  }

  _onKeydown(event: KeyboardEvent) {
    switch (event.keyCode) {
      case RIGHT_ARROW:
        this._setStepFocused((this._focusIndex + 1) % this._steps.length);
        break;
      case LEFT_ARROW:
        this._setStepFocused((this._focusIndex + this._steps.length - 1) % this._steps.length);
        break;
      case SPACE:
      case ENTER:
        this._emitStepperSelectionEvent(this._focusIndex);
        break;
      default:
        // Return to avoid calling preventDefault on keys that are not explicitly handled.
        return;
    }
    event.preventDefault();
  }

  private _setStepFocused(index: number) {
    this._focusIndex = index;
    this._stepHeader.toArray()[this._focusIndex].nativeElement.focus();
  }
}
