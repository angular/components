import {NgModule} from '@angular/core';
import {MdMonthView} from './month-view';
import {CommonModule} from '@angular/common';
import {MdCalendarTable} from './calendar-table';
import {MdYearView} from './year-view';
import {DatetimeModule} from '../core/datetime/index';
import {OverlayModule} from '../core/overlay/overlay-directives';
import {MdDatepicker} from './datepicker';
import {MdDatepickerInput} from './datepicker-input';
import {MdDialogModule} from '../dialog/index';
import {MdCalendar} from './calendar';
import {MdDatepickerToggle} from './datepicker-toggle';


export * from './calendar';
export * from './calendar-table';
export * from './datepicker';
export * from './datepicker-input';
export * from './month-view';
export * from './year-view';


@NgModule({
  imports: [
    CommonModule,
    DatetimeModule,
    MdDialogModule,
    OverlayModule,
  ],
  exports: [
    MdDatepicker,
    MdDatepickerInput,
    MdDatepickerToggle,
  ],
  declarations: [
    MdCalendar,
    MdCalendarTable,
    MdDatepicker,
    MdDatepickerInput,
    MdDatepickerToggle,
    MdMonthView,
    MdYearView,
  ],
})
export class MdDatepickerModule {}
