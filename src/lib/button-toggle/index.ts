import {NgModule, ModuleWithProviders} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CompatibilityModule} from '../core';
import {MdButtonToggleGroup, MdButtonToggle} from './button-toggle';

export * from './button-toggle';
export * from './button-toggle-errors';


@NgModule({
  imports: [FormsModule, CompatibilityModule],
  exports: [
    MdButtonToggleGroup,
    MdButtonToggle,
    CompatibilityModule,
  ],
  declarations: [MdButtonToggleGroup, MdButtonToggle]
})
export class MdButtonToggleModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdButtonToggleModule,
      providers: []
    };
  }
}
