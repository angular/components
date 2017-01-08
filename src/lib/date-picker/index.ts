import {NgModule, ModuleWithProviders} from '@angular/core';
import {MdMonthView} from './month-view';
import {DefaultStyleCompatibilityModeModule} from '../core/compatibility/default-mode';
import {CommonModule} from '@angular/common';
import {MdCalendarTable} from './calendar-table';

export * from './month-view';
export * from './calendar-table';


@NgModule({
  imports: [CommonModule, DefaultStyleCompatibilityModeModule],
  exports: [MdMonthView, MdCalendarTable, DefaultStyleCompatibilityModeModule],
  declarations: [MdMonthView, MdCalendarTable],
})
export class MdDatePickerModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdDatePickerModule,
      providers: []
    };
  }
}
