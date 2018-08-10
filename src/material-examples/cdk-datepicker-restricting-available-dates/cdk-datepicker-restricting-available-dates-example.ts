import {Component, Input} from '@angular/core';
import {CalendarView} from '@angular/cdk/datetime';

/** @title CDK Datepicker with filter, min and max, and start date validation */
@Component({
  selector: 'cdk-datepicker-restricting-available-dates-example',
  templateUrl: 'cdk-datepicker-restricting-available-dates-example.html',
  styleUrls: ['cdk-datepicker-restricting-available-dates-example.css'],
})
export class CdkDatepickerRestrictingAvailableDatesExample {
  dates: Date[] = [];
  minDate = new Date(2000, 0, 1);
  maxDate = new Date(2020, 0, 1);
  startDate = new Date(1990, 0, 1);

  constructor() {
    this.dates.push(new Date(1800, 8, 9));
    this.dates.push(new Date(2018, 8, 9));
    this.dates.push(new Date(2018, 8, 15));
  }

  myFilter = (d: Date): boolean => {
    if (d) {
      const day = d.getDay();
      // Prevent Saturday and Sunday from being selected.
      return day !== 0 && day !== 6;
    } else {
      return true;
    }
  }
}


@Component({
  selector: 'my-filter-calendar',
  outputs: ['selectedChange'],
  template: `
    <div *ngFor="let date of dates">
      <button [disabled]="!myFilter(date)">{{date}}</button>
    </div>
  `,
  providers: [{provide: CalendarView, useExisting: MyFilterCalendar}],
})
export class MyFilterCalendar extends CalendarView<Date> {
  @Input() dates: Date[];

  activeDate = null;
  minDate = null;
  maxDate = null;
  selected = null;
  dateFilter = () => true;

  myFilter(d: Date): boolean {
    if (d) {
      const day = d.getDay();
      // Prevent Saturday and Sunday from being selected.
      return day !== 0 && day !== 6;
    } else {
      return true;
    }
  }
}


@Component({
  selector: 'my-min-max-calendar',
  outputs: ['selectedChange'],
  template: `
    <div>Date: {{selected}}</div>
    <div *ngFor="let date of dates">
      <button [disabled]="_isDisabled(date)" (click)="_selected(date)">{{date}}</button>
    </div>
  `,
  providers: [{provide: CalendarView, useExisting: MyMinMaxCalendar}],
})
export class MyMinMaxCalendar<D> extends CalendarView<D> {
  @Input() dates: D[];

  activeDate: D;
  minDate: D | null = null;
  maxDate: D | null = null;
  selected: D | null = null;
  dateFilter = () => true;

  _isDisabled(d: D): boolean {
    if (this.minDate && this.maxDate) {
      return !(this.minDate < d && d < this.maxDate);
    }
    return false;
  }

  _selected(d: D) {
    this.selected = d;
    this.selectedChange.emit(d);
  }
}


@Component({
  selector: 'my-start-date-calendar',
  outputs: ['selectedChange'],
  template: `
    <div>Date: {{selected}}</div>
    <div *ngFor="let date of dates">
      <div *ngIf="_isFocused(date)">*Start at date below*</div>
      <button (click)="_selected(date)">{{date}}</button>
    </div>
  `,
  providers: [{provide: CalendarView, useExisting: MyStartDateCalendar}],
})
export class MyStartDateCalendar<D> extends CalendarView<D> {
  @Input() dates: Date[];

  activeDate: D | null;
  minDate: D | null = null;
  maxDate: D | null = null;
  selected: D | null = null;
  dateFilter = () => true;
  active: Date = new Date(2018, 8, 9);

  _isFocused(d: Date) {
    return d.getMonth() == this.active.getMonth() && d.getDay() == this.active.getDay();
  }

  _selected(d: D) {
    this.selected = d;
    this.selectedChange.emit(d);
  }
}
