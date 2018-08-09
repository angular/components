import {Component, Input} from '@angular/core';
import {CalendarView} from '@angular/cdk/datetime';

/** @title CDK Datepicker with filter validation */
@Component({
  selector: 'cdk-datepicker-filter-example',
  templateUrl: 'cdk-datepicker-filter-example.html',
  styleUrls: ['cdk-datepicker-filter-example.css'],
})
export class CdkDatepickerFilterExample {
  dates: Date[] = [];
  constructor() {
    this.dates.push(new Date(2018,8,9));
    this.dates.push(new Date(2018,8,8));
    this.dates.push(new Date(2018,8,12));
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
