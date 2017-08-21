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
  selector: 'cdkStepContent',
  host: {
    'role': 'tabpanel',
    '[attr.id]': 'contentId',
    '[attr.aria-labelledby]': 'labelId',
    '[attr.aria-expanded]': 'selectedIndex == index',
  }
})
export class CdkStepContent {
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

  /** Index of selected step in stepper. */
  @Input()
  get selectedIndex() { return this._selectedIndex; }
  set selectedIndex(value: any) {
    this._selectedIndex = coerceNumberProperty(value);
  }
  private _selectedIndex: number;

  /** Returns the step at the index position in stepper. */
  get step(): CdkStep {
    return this._stepper._steps.toArray()[this._index];
  }

  constructor(private _stepper: CdkStepper) { }
}
