import {Component, Input} from '@angular/core';
import {CalendarView, DateAdapter} from '@angular/cdk/datetime';

/** @title CDK Disabled datepicker */
@Component({
  selector: 'cdk-datepicker-disabled-example',
  templateUrl: 'cdk-datepicker-disabled-example.html',
  styleUrls: ['cdk-datepicker-disabled-example.css'],
})
export class CdkDatepickerDisabledExample {
  dates: Date[] = [];
  messages: string[] = [];
  disabled: boolean = false;

  constructor(private _dateAdapter: DateAdapter<Date>) {
    this.dates.push(this._dateAdapter.addCalendarDays(this._dateAdapter.today(), 5));
    this.dates.push(this._dateAdapter.addCalendarDays(this._dateAdapter.today(), 10));
    this.dates.push(this._dateAdapter.addCalendarDays(this._dateAdapter.today(), 15));
  }

  _disabledChanged() {
    this.messages.push('Disabled property has changed.');
  }

  _setDisabled(disabled: boolean) {
    this.disabled = !disabled;
    this._disabledChanged();
  }
}


@Component({
  selector: 'my-disabled-calendar',
  outputs: ['selectedChange'],
  template: `   
    <div>Date: {{this.selected}}</div>
    <div *ngFor="let date of dates">
      <button (click)="_selected(date)">{{date}}</button>
    </div>
  `,
  providers: [{provide: CalendarView, useExisting: MyDisabledCalendar}],
})
export class MyDisabledCalendar<D> extends CalendarView<D> {
  @Input() dates: D[];
  @Input() disabled: boolean;

  activeDate: D | null = null;
  minDate = null;
  maxDate = null;
  selected: D | null = null;
  dateFilter = () => true;

  _selected(date: D) {
    if (this.disabled) {} else {
      this.selected = date;
      this.selectedChange.emit(date);
    }
  }
}
