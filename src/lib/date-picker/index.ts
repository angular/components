import {NgModule, ModuleWithProviders} from '@angular/core';
import {MdMonthView} from './month-view';
import {DefaultStyleCompatibilityModeModule} from '../core/compatibility/default-mode';
import {CommonModule} from '@angular/common';
import {MdCalendarTable} from './calendar-table';
import {DateLocale} from './date-locale';
import {MdYearView} from './year-view';


export * from './calendar-table';
export * from './date-locale'
export * from './month-view';
export * from './year-view';


@NgModule({
  imports: [CommonModule, DefaultStyleCompatibilityModeModule],
  exports: [MdCalendarTable, MdMonthView, MdYearView, DefaultStyleCompatibilityModeModule],
  declarations: [MdCalendarTable, MdMonthView, MdYearView],
  providers: [DateLocale]
})
export class MdDatePickerModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdDatePickerModule,
      providers: [DateLocale]
    };
  }
}
