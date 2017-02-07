import {NgModule} from '@angular/core';
import {MdMonthView} from './month-view';
import {CommonModule} from '@angular/common';
import {MdCalendarTable} from './calendar-table';
import {MdYearView} from './year-view';
import {DatetimeModule} from '../core/datetime/index';


export * from './calendar-table';
export * from './month-view';
export * from './year-view';


@NgModule({
  imports: [CommonModule, DatetimeModule],
  exports: [MdCalendarTable, MdMonthView, MdYearView],
  declarations: [MdCalendarTable, MdMonthView, MdYearView],
})
export class MdDatepickerModule {}
