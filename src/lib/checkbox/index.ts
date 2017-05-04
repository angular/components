import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MdRippleModule, MdCommonModule, FocusOriginMonitor} from '../core';
import {MdCheckbox, MdCheckboxRequiredValidator} from './checkbox';


@NgModule({
  imports: [CommonModule, MdRippleModule, MdCommonModule],
  exports: [MdCheckbox, MdCheckboxRequiredValidator, MdCommonModule],
  declarations: [MdCheckbox, MdCheckboxRequiredValidator],
  providers: [FocusOriginMonitor]
})
export class MdCheckboxModule {}


export * from './checkbox';
