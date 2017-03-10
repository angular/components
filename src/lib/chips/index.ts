import {NgModule, ModuleWithProviders} from '@angular/core';
import {MdChipList} from './chip-list';
import {MdChip} from './chip';
import {MdChipInput} from './chip-input';
import {MdChipRemove} from './chip-remove';

export * from './chip-list';
export * from './chip';
export * from './chip-input';
export * from './chip-remove';

@NgModule({
  imports: [],
  exports: [MdChipList, MdChip, MdChipInput, MdChipRemove],
  declarations: [MdChipList, MdChip, MdChipInput, MdChipRemove]
})
export class MdChipsModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdChipsModule,
      providers: []
    };
  }
}
