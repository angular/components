import {NgModule} from '@angular/core';
import {DateAdapter} from './date-adapter';
import {NativeDateAdapter} from './native-date-adapter';


export * from './date-adapter';
export * from './native-date-adapter';


@NgModule({
  providers: [{provide: DateAdapter, useClass: NativeDateAdapter}],
})
export class DatetimeModule {}
