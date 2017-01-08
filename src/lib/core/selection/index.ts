import {NgModule, ModuleWithProviders} from '@angular/core';
import {MdPseudoCheckbox} from './pseudo-checkbox/pseudo-checkbox';

export * from './pseudo-checkbox/pseudo-checkbox';

@NgModule({
  exports: [MdPseudoCheckbox],
  declarations: [MdPseudoCheckbox]
})
export class MdSelectionModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdSelectionModule,
      providers: []
    };
  }
}
