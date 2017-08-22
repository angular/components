/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Input, ViewEncapsulation} from '@angular/core';
import {coerceBooleanProperty, coerceNumberProperty} from '@angular/cdk/coercion';
import {MdStepLabel} from './step-label';

@Component({
  selector: 'md-step-header, mat-step-header',
  templateUrl: 'step-header.html',
  styleUrls: ['step-header.css'],
  host: {
    'class': 'mat-step-header',
    'role': 'tab',
    '[attr.id]': 'labelId',
    '[attr.aria-controls]': 'contentId',
    '[attr.aria-selected]': 'selected'
  },
  encapsulation: ViewEncapsulation.None
})
export class MdStepHeader {
  /** Unique label ID of step header. */
  @Input()
  labelId: string;

  /** Unique content ID of step content. */
  @Input()
  contentId: string;

  /** Icon for the given step. */
  @Input()
  icon: string;

  /** Text label of the given step. */
  @Input()
  get label() { return this._label; }
  set label(value: any) {
    this._label = value;
  }
  private _label: string;

  /** Templated label of the given step. */
  @Input()
  get stepLabel() { return this._stepLabel; }
  set stepLabel(value: any) {
    this._stepLabel = value;
  }
  private _stepLabel: MdStepLabel;

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

  /** Whether the given step label is active. */
  @Input()
  get active() { return this._active; }
  set active(value: any) {
    this._active = coerceBooleanProperty(value);
  }
  private _active: boolean;

  /** Whether the given step is optional. */
  @Input()
  get optional() { return this._optional; }
  set optional(value: any) {
    this._optional = coerceBooleanProperty(value);
  }
  private _optional: boolean;
}
