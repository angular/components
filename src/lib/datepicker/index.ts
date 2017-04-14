import {NgModule} from '@angular/core';
import {MdMonthView} from './month-view';
import {CommonModule} from '@angular/common';
import {MdCalendarTable} from './calendar-table';
import {MdYearView} from './year-view';
import {DatetimeModule} from '../core/datetime/index';
import {OverlayModule} from '../core/overlay/overlay-directives';
import {MdDatepicker, MdDatepickerContent} from './datepicker';
import {MdDatepickerInput} from './datepicker-input';
import {MdDialogModule} from '../dialog/index';
import {MdCalendar} from './calendar';
import {MdDatepickerToggle} from './datepicker-toggle';
import {StyleModule} from '../core/style/index';
import {MdButtonModule} from '../button/index';


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
    MdButtonModule,
    MdDialogModule,
    OverlayModule,
    StyleModule,
  ],
  exports: [
    MdDatepicker,
    MdDatepickerContent,
    MdDatepickerInput,
    MdDatepickerToggle,
  ],
  declarations: [
    MdCalendar,
    MdCalendarTable,
    MdDatepicker,
    MdDatepickerContent,
    MdDatepickerInput,
    MdDatepickerToggle,
    MdMonthView,
    MdYearView,
  ],
  entryComponents: [
    MdDatepickerContent,
  ]
})
export class MdDatepickerModule {}
