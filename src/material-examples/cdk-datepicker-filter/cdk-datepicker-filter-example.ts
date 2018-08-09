import {Component, Input} from '@angular/core';
import {CalendarView, DateAdapter} from '@angular/cdk/datetime';

/** @title CDK Datepicker with filter validation */
@Component({
  selector: 'cdk-datepicker-filter-example',
  templateUrl: 'cdk-datepicker-filter-example.html',
  styleUrls: ['cdk-datepicker-filter-example.css'],
})
export class CdkDatepickerFilterExample<D> {
  dates: D[] = [];
  constructor(_dateAdapter: DateAdapter<D>) {
    this.dates.push(_dateAdapter.addCalendarDays(_dateAdapter.today(), 3));
    this.dates.push(_dateAdapter.addCalendarDays(_dateAdapter.today(), 5));
    this.dates.push(_dateAdapter.addCalendarDays(_dateAdapter.today(), 10));
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
    <div *ngIf="this.dateFilter()">Date: {{this.selected}}</div>
  `,
  providers: [{provide: CalendarView, useExisting: MyFilterCalendar}],
})
export class MyFilterCalendar<D> extends CalendarView<D> {
  @Input() dates: D[];

  activeDate: D;
  minDate = null;
  maxDate = null;
  selected: D | null = null;
  dateFilter = () => false;

  _selected(d: D) {
    this.selected = d;
  }
}
