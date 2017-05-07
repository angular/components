import {NgModule} from '@angular/core';
import {MdLineModule, MdRippleModule, MdCommonModule} from '../core';
import {
  MdList,
  MdNavList,
  MdListItem,
  MdListDivider,
  MdListAvatarCssMatStyler,
  MdListIconCssMatStyler,
  MdListCssMatStyler,
  MdDividerCssMatStyler,
  MdListSubheaderCssMatStyler,
} from './list';


@NgModule({
  imports: [MdLineModule, MdRippleModule, MdCommonModule],
  exports: [
    MdList,
    MdNavList,
    MdListItem,
    MdListDivider,
    MdListAvatarCssMatStyler,
    MdLineModule,
    MdCommonModule,
    MdListIconCssMatStyler,
    MdListCssMatStyler,
    MdDividerCssMatStyler,
    MdListSubheaderCssMatStyler,
  ],
  declarations: [
    MdList,
    MdNavList,
    MdListItem,
    MdListDivider,
    MdListAvatarCssMatStyler,
    MdListIconCssMatStyler,
    MdListCssMatStyler,
    MdDividerCssMatStyler,
    MdListSubheaderCssMatStyler,
  ],
})
export class MdListModule {}


export * from './list';
