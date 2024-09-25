import {ChangeDetectionStrategy, Component, Injectable, inject} from '@angular/core';
import {DateAdapter, provideNativeDateAdapter} from '@angular/material/core';
import {
  DateRange,
  MAT_DATE_RANGE_SELECTION_STRATEGY,
  MatDateRangeSelectionStrategy,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';

@Injectable()
export class FiveDayRangeSelectionStrategy<D> implements MatDateRangeSelectionStrategy<D> {
  private _dateAdapter = inject<DateAdapter<D>>(DateAdapter<D>);

  selectionFinished(date: D | null): DateRange<D> {
    return this._createFiveDayRange(date);
  }

  createPreview(activeDate: D | null): DateRange<D> {
    return this._createFiveDayRange(activeDate);
  }

  private _createFiveDayRange(date: D | null): DateRange<D> {
    if (date) {
      const start = this._dateAdapter.addCalendarDays(date, -2);
      const end = this._dateAdapter.addCalendarDays(date, 2);
      return new DateRange<D>(start, end);
    }

    return new DateRange<D>(null, null);
  }
}

/** @title Date range picker with a custom selection strategy */
@Component({
  selector: 'date-range-picker-selection-strategy-example',
  templateUrl: 'date-range-picker-selection-strategy-example.html',
  providers: [
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useClass: FiveDayRangeSelectionStrategy,
    },
    provideNativeDateAdapter(),
  ],
  standalone: true,
  imports: [MatFormFieldModule, MatDatepickerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateRangePickerSelectionStrategyExample {}
