import {NgModule} from '@angular/core';
import {CdkMonitorFocus, FOCUS_ORIGIN_MONITOR_PROVIDER} from './focus-classes';

export * from './focus-classes';
export * from './apply-transform';


@NgModule({
  declarations: [CdkMonitorFocus],
  exports: [CdkMonitorFocus],
  providers: [FOCUS_ORIGIN_MONITOR_PROVIDER],
})
export class StyleModule {}
