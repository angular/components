import {NgModule} from '@angular/core';
import {DefaultCalendarLocale, CalendarLocale} from './calendar-locale';


export * from './calendar-locale';
export * from './simple-date';


@NgModule({
  providers: [{provide: CalendarLocale, useClass: DefaultCalendarLocale}],
})
export class DatetimeModule {}
