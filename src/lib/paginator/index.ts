import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MdCommonModule, OverlayModule} from '../core';
import {MdButtonModule} from '../button';
import {MdSelectModule} from '../select';
import {MdPaginator} from './paginator';
import {MdPaginatorIntl} from './paginator-intl';
import {MdTooltipModule} from '../tooltip';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MdButtonModule,
    MdCommonModule,
    MdSelectModule,
    MdTooltipModule,
    OverlayModule,
  ],
  exports: [MdPaginator],
  declarations: [MdPaginator],
  providers: [
    MdPaginatorIntl,
  ],
})
export class MdPaginatorModule {}


export * from './paginator';
