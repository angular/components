/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, Input, ViewEncapsulation} from '@angular/core';
import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';

@Component({
  selector: 'mat-divider',
  host: {
    'role': 'separator',
    '[attr.aria-orientation]': 'vertical ? "vertical" : "horizontal"',
    '[class.mat-divider-vertical]': 'vertical',
    '[class.mat-divider-horizontal]': '!vertical',
    '[class.mat-divider-inset]': 'inset',
    'class': 'mat-divider',
  },
  template: '',
  styleUrl: 'divider.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatDivider {
  /** Whether the divider is vertically aligned. */
  @Input()
  get vertical(): boolean {
    return this._vertical;
  }
  set vertical(value: BooleanInput) {
    this._vertical = coerceBooleanProperty(value);
  }
  private _vertical: boolean = false;

  /** Whether the divider is an inset divider. */
  @Input()
  get inset(): boolean {
    return this._inset;
  }
  set inset(value: BooleanInput) {
    this._inset = coerceBooleanProperty(value);
  }
  private _inset: boolean = false;
}
