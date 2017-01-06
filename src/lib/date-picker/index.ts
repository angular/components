import {ModuleWithProviders, NgModule} from '@angular/core';
import {MdMonthView} from './month-view';
import {DefaultStyleCompatibilityModeModule} from '../core/compatibility/default-mode';

export * from './month-view';

@NgModule({
  imports: [DefaultStyleCompatibilityModeModule],
  exports: [MdMonthView, DefaultStyleCompatibilityModeModule],
  declarations: [MdMonthView],
})
export class MdDatePickerModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdDatePickerModule,
      providers: []
    };
  }
}
