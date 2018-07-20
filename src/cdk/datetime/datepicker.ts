/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Optional,
  ViewEncapsulation,
  OnDestroy,
  ContentChild,
} from '@angular/core';
import {Subject, Subscription} from 'rxjs';
import {DateAdapter} from './date-adapter';
import {CdkDatepickerInput} from './datepicker-input';
import {CalendarView} from './calendar-view';
import {coerceBooleanProperty} from '@angular/cdk/coercion';

/** Used to generate a unique ID for each datepicker instance. */
let datepickerUid = 0;

/** Component used to wire together the datepicker input and calendar view. */
@Component({
  moduleId: module.id,
  selector: 'cdk-datepicker',
  host: {
    '[id]': 'id',
  },
  template: '<ng-content></ng-content>',
  exportAs: 'cdkDatepicker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class CdkDatepicker<D> implements OnDestroy {
  /** The initial date of the datepicker. */
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

  /** Whether the datepicker should be disabled. */
  @Input()
  get disabled(): boolean {
    return this._disabled === undefined && this._datepickerInput ?
        this._datepickerInput.disabled : !!this._disabled;
  }
  set disabled(value: boolean) {
    const newValue = coerceBooleanProperty(value);

    if (newValue !== this._disabled) {
      this._disabled = newValue;
      this._disabledChange.next(newValue);
    }
  }
  private _disabled: boolean;

  /** The calendar view displayed in this datepicker. */
  @ContentChild(CalendarView) view: CalendarView<D>;

  /** The id for the datepicker calendar. */
  @Input() id: string = `cdk-datepicker-${datepickerUid++}`;

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

  /** The filter function used to determine which dates are selectable. */
  get _dateFilter(): (date: D | null) => boolean {
    return this._datepickerInput && this._datepickerInput._dateFilter;
  }

  /** Subscription to value changes in the associated input element. */
  private _inputSubscription = Subscription.EMPTY;

  /** The input element this datepicker is associated with. */
  _datepickerInput: CdkDatepickerInput<D>;

  /** Emits when the datepicker's disabled state changes. */
  readonly _disabledChange = new Subject<boolean>();

  /** Emits new selected date when selected date changes. */
  readonly _selectedChanged = new Subject<D>();

  constructor(@Optional() protected _dateAdapter: DateAdapter<D>) {
    if (!this._dateAdapter) {
      throw Error('CdkDatepicker: No provider found for DateAdapter.');
    }
  }

  ngOnDestroy() {
    this._inputSubscription.unsubscribe();
    this._disabledChange.complete();
  }

  /** Selects the given date */
  select(date: D): void {
    let oldValue = this._selected;
    this._selected = date;
    if (!this._dateAdapter.sameDate(oldValue, this._selected)) {
      this._selectedChanged.next(date);
    }
  }

  /**
   * Register an input with this datepicker.
   * @param input The datepicker input to register with this datepicker.
   */
  _registerInput(input: CdkDatepickerInput<D>): void {
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
  private _getValidDateOrNull(obj: any): D | null {
    return (this._dateAdapter.isDateInstance(obj) && this._dateAdapter.isValid(obj)) ? obj : null;
  }
}
