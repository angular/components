/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  NgZone,
  Optional,
  Output,
  ViewContainerRef,
  ViewEncapsulation,
  OnDestroy,
} from '@angular/core';
import {CalendarView} from '@angular/cdk/datepicker/calendar-view';
import {CdkDatepickerInput} from './datepicker-input';
import {DateAdapter} from '@angular/material/core';
import {Subject, Subscription} from 'rxjs';


/** Used to generate a unique ID for each datepicker instance. */
let datepickerUid = 0;

// TODO(vwei): We use a component instead of a directive here so the user can use implicit
// template reference variables (e.g. #d vs #d="cdkDatepicker"). We can change this to a directive
// if angular adds support for `exportAs: '$implicit'` on directives.
/** Component responsible for managing the datepicker CDK. */
@Component({
  moduleId: module.id,
  selector: 'cdk-datepicker',
  template: '<ng-content></ng-content>',
  exportAs: 'cdkDatepicker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class CdkDatepicker<D> implements OnDestroy {
  /** The initial date of the datepicker CDK. */
  @Input()
  get startAt(): D | null {
    // If an explicit startAt is set we start there, otherwise we start at whatever the currently
    // selected value is.
    return this._startAt || (this._datepickerInput ? this._datepickerInput.value : null);
  }
  set startAt(value: D | null) {
    this._startAt = this._getValidDateOrNull(this._dateAdapter.deserialize(value));
  }
  private _startAt: D | null;

  @ContentChild(CalendarView) view: CalendarView<D>;

  /** The id for the datepicker calendar. */
  id: string = `cdk-datepicker-${datepickerUid++}`;

  /** The currently selected date. */
  get _selected(): D | null { return this._validSelected; }
  set _selected(value: D | null) { this._validSelected = value; }
  private _validSelected: D | null = null;

  /** The minimum selectable date. */
  get _minDate(): D | null {
    return this._datepickerInput && this._datepickerInput.min;
  }

  /** The maximum selectable date. */
  get _maxDate(): D | null {
    return this._datepickerInput && this._datepickerInput.max;
  }

  get _dateFilter(): (date: D | null) => boolean {
    return this._datepickerInput && this._datepickerInput._dateFilter;
  }

  /** Subscription to value changes in the associated input element. */
  private _inputSubscription = Subscription.EMPTY;

  /** The input element this datepicker is associated with. */
  _datepickerInput: CdkDatepickerInput<D>;

  /** Emits when the datepicker is disabled. */
  readonly _disabledChange = new Subject<boolean>();

  /** Emits new selected date when selected date changes. */
  readonly _selectedChanged = new Subject<D>();

  constructor(@Optional() private _dateAdapter: DateAdapter<D>) {
    if (!this._dateAdapter) {
      throw Error('CdkDatepicker: No provider found for DateAdapter.');
    }
  }

  ngOnDestroy() {
    this._inputSubscription.unsubscribe();
    this._disabledChange.complete();
  }

  /**
   * Register an input with this datepicker.
   * @param input The datepicker input to register with this datepicker.
   */
  _registerCdkInput(input: CdkDatepickerInput<D>): void {
    if (this._datepickerInput) {
      throw Error('A CdkDatepicker can only be associated with a single input.');
    }
    this._datepickerInput = input;
    this._inputSubscription =
        this._datepickerInput._valueChange.subscribe((value: D | null) => this._selected = value);
  }

  /**
   * @param obj The object to check.
   * @returns The given object if it is both a date instance and valid, otherwise null.
   */
  protected _getValidDateOrNull(obj: any): D | null {
    return (this._dateAdapter.isDateInstance(obj) && this._dateAdapter.isValid(obj)) ? obj : null;
  }
}
