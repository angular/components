/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Directive, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {coerceBooleanProperty} from '@angular/cdk/coercion';

@Directive({
  selector: '[matProgress]',
  host: {
    '[attr.role]': 'showProgress ? "alert" : null',
    '[attr.aria-live]': 'showProgress ? "assertive" : null',
    '[class.mat-progress-host]': 'showProgress',
  }
})
export class MatProgress implements OnDestroy {
  /** Event emitted when the progress container should be shown. */
  @Output() readonly show: EventEmitter<boolean> = new EventEmitter<boolean>();

  /** Whether to display the progress instance. */
  @Input('matProgress')
  get showProgress(): boolean { return this._showProgress; }
  set showProgress(value: boolean) {
    this._showProgress = coerceBooleanProperty(value);
    this.show.emit(this._showProgress);
  }
  private _showProgress: boolean;

  constructor() {}

  ngOnDestroy() {
    this.show.complete();
  }
}
