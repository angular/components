import {Input, Component} from '@angular/core';
import {CalendarView, DateAdapter} from '@angular/cdk/datetime';


/** @title Basic CDK datepicker */
@Component({
  selector: 'cdk-datepicker-overview-example',
  templateUrl: 'cdk-datepicker-overview-example.html',
  styleUrls: ['cdk-datepicker-overview-example.css'],
})
export class CdkDatepickerOverviewExample<D> {
  dates: D[] = [];
  disabled: boolean = false;

  constructor(private _dateAdapter: DateAdapter<D>) {
    this.dates.push(this._dateAdapter.addCalendarDays(this._dateAdapter.today(), 5));
    this.dates.push(this._dateAdapter.addCalendarDays(this._dateAdapter.today(), 10));
    this.dates.push(this._dateAdapter.addCalendarDays(this._dateAdapter.today(), 15));
  }

  _setDisabled(disabled: boolean) {
    this.disabled = !disabled;
  }
}


@Component({
  selector: 'my-calendar',
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
        <button [disabled]="disabled" (click)="_selected(date)">{{date}}</button>
      </div>
    </div>
  `,
  providers: [{provide: CalendarView, useExisting: MyCalendar}],
})
export class MyCalendar<D> extends CalendarView<D> {
  @Input() dates: D[];
  @Input() disabled: boolean;

  activeDate: D | null = null;
  minDate = null;
  maxDate = null;
  selected: D | null = null;
  dateFilter = () => true;

  _selected(date: D) {
    this.selected = date;
    this.selectedChange.emit(date);
  }
}
