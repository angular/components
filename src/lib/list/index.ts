import {NgModule, ModuleWithProviders} from '@angular/core';
import {MdLineModule} from '../core';
import {MdList} from './list';
import {MdListItem} from './list-item';
import {MdListDivider, MdListAvatar} from './list-directives';


@NgModule({
  imports: [MdLineModule],
  exports: [MdList, MdListItem, MdListDivider, MdListAvatar, MdLineModule],
  declarations: [MdList, MdListItem, MdListDivider, MdListAvatar],
})
export class MdListModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdListModule,
      providers: []
    };
  }
}
