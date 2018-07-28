import {Component} from '@angular/core';
import {CalendarView, DateAdapter} from '@angular/cdk/datetime';


/** @title Basic CDK datepicker */
@Component({
  selector: 'cdk-datepicker-overview-example',
  templateUrl: 'cdk-datepicker-overview-example.html',
  styleUrls: ['cdk-datepicker-overview-example.css'],
})
export class CdkDatepickerOverviewExample {}


@Component( {
  selector: 'calendar',
  template: `<button (click)="firstSelected()">{{firstDate}}</button>
    <button (click)="secondSelected()">{{secondDate}}</button>
    <div>{{selected}}</div>
  `,
})
export class Calendar<D> extends CalendarView<D> {
  activeDate: D;
  minDate = null;
  maxDate = null;
  selected: D | null;

  firstDate: D;
  secondDate: D;
  constructor(private _dateAdapter: DateAdapter<D>) {
    super();
    this.selected = null;
    this.activeDate = this._dateAdapter.today();
    this.firstDate = this._dateAdapter.addCalendarDays(this.activeDate, 5);
    this.secondDate = this._dateAdapter.addCalendarDays(this.activeDate, 10);
  }

  firstSelected() {
    this.selected = this.firstDate;
    this.selectedChange.emit(this.firstDate);
  }

  secondSelected() {
    this.selected = this.secondDate;
    this.selectedChange.emit(this.secondDate);
  }
}
