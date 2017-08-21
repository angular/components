/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Input} from '@angular/core';
import {CdkStep, CdkStepper} from './stepper';
import {coerceBooleanProperty, coerceNumberProperty} from '@angular/cdk/coercion';

@Directive({
  selector: 'cdkStepHeader',
  host: {
    'role': 'tab',
    '[attr.id]': 'labelId',
    '[attr.aria-controls]': 'contentId',
    '[attr.aria-selected]': 'selected'
  }
})
export class CdkStepHeader {
  /** Whether the orientation of stepper is horizontal. */
  @Input()
  get horizontal() { return this._horizontal; }
  set horizontal(value: any) {
    this._horizontal = coerceBooleanProperty(value);
  }
  private _horizontal: boolean;

  /** Unique label ID of step header. */
  @Input()
  labelId: string;

  /** Unique content ID of step content. */
  @Input()
  contentId: string;

  /** Index of the given step. */
  @Input()
  get index() { return this._index; }
  set index(value: any) {
    this._index = coerceNumberProperty(value);
  }
  private _index: number;

  /** Whether the given step is selected. */
  @Input()
  get selected() { return this._selected; }
  set selected(value: any) {
    this._selected = coerceBooleanProperty(value);
  }
  private _selected: boolean;


  /** Returns the step at the index position in stepper. */
  get step(): CdkStep {
    return this._stepper._steps.toArray()[this._index];
  }

  constructor(private _stepper: CdkStepper) { }

  /** Returns the type of icon to be displayed. */
  _getIndicatorType(): 'number' | 'edit' | 'done' {
    if (!this.step.completed || this._selected) {
      return 'number';
    } else {
      return this.step.editable ? 'edit' : 'done';
    }
  }
}
