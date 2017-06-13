import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OverlayModule, MdCommonModule} from '../core';
import {MdPaginator} from './paginator';
import {MdSelectModule} from '../select';
import {MdButtonModule} from '../button';
import {FormsModule} from '@angular/forms';


@NgModule({
  imports: [
    OverlayModule,
    CommonModule,
    MdCommonModule,
    MdSelectModule,
    MdButtonModule,
    FormsModule,
  ],
  exports: [MdPaginator],
  declarations: [MdPaginator],
})
export class MdPaginatorModule {}


export * from './paginator';
