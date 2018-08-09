import {Component, Input} from '@angular/core';
import {CalendarView, DateAdapter} from '@angular/cdk/datetime';

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
    this.dates.push(new Date(1800,8,9));
    this.dates.push(new Date(1999,8,8));
    this.dates.push(new Date(2018,8,15));
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
      <button (click)="_selected(date)">{{date}}</button>
    </div>
    <div>{{this.validDate}}</div>
  `,
  providers: [{provide: CalendarView, useExisting: MyFilterCalendar}],
})
export class MyFilterCalendar<D> extends CalendarView<D> {
  @Input() dates: Date[];

  activeDate = null;
  minDate = null;
  maxDate = null;
  selected = null;
  validDate: string = "";
  dateFilter = () => true;

  myFilter(d: Date): boolean {
    if (d) {
      const day = d.getDay();
      // Prevent Saturday and Sunday from being selected.
      return day !== 0 && day !== 6;
    } else {
      return true;
    }
  };

  _selected(d: Date) {
    if (this.myFilter(d)) {
      this.validDate = "This is a valid date.";
    } else {
      this.validDate = "This is not a valid date.";
    }
  }
}


@Component({
  selector: 'my-min-max-calendar',
  outputs: ['selectedChange'],
  template: `
    <div *ngFor="let date of dates">
      <button (click)="_selected(date)">{{date}}</button>
    </div>
    <div>Date: {{this.validDate}}</div>
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
  validDate: string = "";

  _selected(d: D) {
    if (this.minDate && this.maxDate) {
      if (this.minDate < d && d < this.maxDate) {
        this.validDate = "This is a valid date.";
      } else {
        this.validDate = "This is not a valid date.";
      }
    }
  }
}


@Component({
  selector: 'my-start-date-calendar',
  outputs: ['selectedChange'],
  template: `
    <div *ngFor="let date of dates">
      <button (click)="_selected(date)">{{date}}</button>
    </div>
    <div>Date: {{this.validDate}}</div>
  `,
  providers: [{provide: CalendarView, useExisting: MyStartDateCalendar}],
})
export class MyStartDateCalendar<D> extends CalendarView<D> {
  @Input() dates: D[];

  activeDate: D | null;
  minDate: D | null = null;
  maxDate: D | null = null;
  selected: D | null = null;
  dateFilter = () => true;
  validDate: string = "";

  _selected(d: D) {
    if (this.activeDate) {
      if (d < this.activeDate) {
        this.validDate = "This is not a valid date.";
      } else {
        this.validDate = "This a valid date.";
      }
    }
  }
}
