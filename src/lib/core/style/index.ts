import {NgModule} from '@angular/core';
import {CdkAddFocusClasses, FOCUS_CAUSE_DETECTOR_PROVIDER} from './add-focus-classes';
import {DefaultStyleCompatibilityModeModule} from '../compatibility/default-mode';

export * from './add-focus-classes';
export * from './apply-transform';


@NgModule({
  imports: [DefaultStyleCompatibilityModeModule],
  declarations: [CdkAddFocusClasses],
  exports: [CdkAddFocusClasses, DefaultStyleCompatibilityModeModule],
  providers: [FOCUS_CAUSE_DETECTOR_PROVIDER],
})
export class StyleModule {}
