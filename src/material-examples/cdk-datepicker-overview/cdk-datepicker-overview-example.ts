import {Component} from '@angular/core';
import {CalendarView, DateAdapter} from '@angular/cdk/datetime';


/** @title Basic CDK datepicker */
@Component({
  selector: 'cdk-datepicker-overview-example',
  templateUrl: 'cdk-datepicker-overview-example.html',
  styleUrls: ['cdk-datepicker-overview-example.css'],
})
export class CdkDatepickerOverviewExample {
  _dateSelected() {
    console.log('Date changed');
  }
}


@Component( {
  selector: 'calendar',
  template: `<button (click)="_firstSelected()">{{_firstDate}}</button>
    <button (click)="_secondSelected()">{{_secondDate}}</button>
    <div>Date: {{selected}}</div>
  `,
})
export class Calendar<D> extends CalendarView<D> {
  activeDate: D;
  minDate = null;
  maxDate = null;
  selected: D | null;

  _firstDate: D;
  _secondDate: D;
  constructor(private _dateAdapter: DateAdapter<D>) {
    super();
    this.selected = null;
    this.activeDate = this._dateAdapter.today();
    this._firstDate = this._dateAdapter.addCalendarDays(this.activeDate, 5);
    this._secondDate = this._dateAdapter.addCalendarDays(this.activeDate, 10);
  }

  _firstSelected() {
    this.selected = this._firstDate;
    this.selectedChange.emit(this._firstDate);
  }

  _secondSelected() {
    this.selected = this._secondDate;
    this.selectedChange.emit(this._secondDate);
  }
}
