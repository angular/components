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
  styles: [`
    .calendar {
      width: 400px;
      height: 150px;
      margin-top: 20px;
      margin-left: 15px;
      overflow: auto;
      background-color: #eee;
      border-radius: 5px;
      padding: 10px;
    }
  `],
  template: `
    <div class="calendar">
      <div>Date: {{selected}}</div>
      <br>
      <div>Choose an appointment date:</div>
      <div *ngFor="let date of dates">
        <button (click)="_dateSelected(date)" [disabled]="!dateFilter(date)">{{date}}</button>
      </div>
    </div>
  `,
  providers: [{provide: CalendarView, useExisting: MyFilterCalendar}],
})
export class MyFilterCalendar<D> extends CalendarView<D> {
  @Input() dates: Date[];

  activeDate = null;
  minDate = null;
  maxDate = null;
  selected: D;
  dateFilter: (date: D) => boolean;

  _dateSelected(date: D) {
    this.selected = date;
    this.selectedChange.emit(date);
  }
}


@Component({
  selector: 'my-min-max-calendar',
  outputs: ['selectedChange'],
  styles: [`
    .calendar {
      width: 400px;
      height: 150px;
      margin-top: 20px;
      margin-left: 15px;
      overflow: auto;
      background-color: #eee;
      border-radius: 5px;
      padding: 10px;
    }
  `],
  template: `
    <div class="calendar">
      <div>Date: {{selected}}</div>
      <br>
      <div>Choose an appointment date:</div>
      <div *ngFor="let date of dates">
        <button [disabled]="_isDisabled(date)" (click)="_selected(date)">{{date}}</button>
      </div>
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
