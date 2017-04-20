import {NgModule} from '@angular/core';
import {DefaultCalendarLocale, CalendarLocale} from './calendar-locale';


export * from './calendar-locale';
export * from './date-adapter';
export * from './simple-date';
export * from './native-date-adapter';


@NgModule({
  providers: [{provide: CalendarLocale, useClass: DefaultCalendarLocale}],
})
export class DatetimeModule {}
