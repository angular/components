/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable, OnDestroy, afterNextRender, inject, Injector} from '@angular/core';
import {ControlContainer} from '@angular/forms';
import {Observable, Subject} from 'rxjs';

import {EditEventDispatcher} from './edit-event-dispatcher';

/**
 * Used for communication between the form within the edit lens and the
 * table that launched it. Provided by CdkEditControl within the lens.
 */
@Injectable()
export class EditRef<FormValue> implements OnDestroy {
  private readonly _form = inject(ControlContainer, {self: true});
  private readonly _editEventDispatcher =
    inject<EditEventDispatcher<EditRef<FormValue>>>(EditEventDispatcher);

  /** Emits the final value of this edit instance before closing. */
  private readonly _finalValueSubject = new Subject<FormValue>();
  readonly finalValue: Observable<FormValue> = this._finalValueSubject;

  /** Emits when the user tabs out of this edit lens before closing. */
  private readonly _blurredSubject = new Subject<void>();
  readonly blurred: Observable<void> = this._blurredSubject;

  /** The value to set the form back to on revert. */
  private _revertFormValue: FormValue;

  private _injector = inject(Injector);

  constructor() {
    this._editEventDispatcher.setActiveEditRef(this);
  }

  /**
   * Called by the host directive's OnInit hook. Reads the initial state of the
   * form and overrides it with persisted state from previous openings, if
   * applicable.
   */
  init(previousFormValue: FormValue | undefined): void {
    // Wait for the next render before caching the initial value.
    // This ensures that all form controls have been initialized.
    afterNextRender(
      () => {
        this.updateRevertValue();
        if (previousFormValue) {
          this.reset(previousFormValue);
        }
      },
      {injector: this._injector},
    );
  }

  ngOnDestroy(): void {
    this._editEventDispatcher.unsetActiveEditRef(this);
    this._finalValueSubject.next(this._form.value);
    this._finalValueSubject.complete();
  }

  /** Whether the attached form is in a valid state. */
  isValid(): boolean | null {
    return this._form.valid;
  }

  /** Set the form's current value as what it will be set to on revert/reset. */
  updateRevertValue(): void {
    this._revertFormValue = this._form.value;
  }

  /** Tells the table to close the edit popup. */
  close(): void {
    this._editEventDispatcher.editing.next(null);
  }

  /** Notifies the active edit that the user has moved focus out of the lens. */
  blur(): void {
    this._blurredSubject.next();
  }

  /**
   * Resets the form value to the specified value or the previously set
   * revert value.
   */
  reset(value?: FormValue): void {
    this._form.reset(value || this._revertFormValue);
  }
}
