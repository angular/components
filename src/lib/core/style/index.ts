import {NgModule} from '@angular/core';
import {CdkAddFocusClasses, FOCUS_ORIGIN_MONITOR_PROVIDER} from './add-focus-classes';

export * from './add-focus-classes';
export * from './apply-transform';


@NgModule({
  declarations: [CdkAddFocusClasses],
  exports: [CdkAddFocusClasses],
  providers: [FOCUS_ORIGIN_MONITOR_PROVIDER],
})
export class StyleModule {}
