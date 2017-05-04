import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MdRippleModule, MdCommonModule, FocusOriginMonitor} from '../core';
import {MdCheckbox} from './checkbox';
import {MdCheckboxRequiredValidator} from './checkbox-required-validator';

@NgModule({
  imports: [CommonModule, MdRippleModule, MdCommonModule],
  exports: [MdCheckbox, MdCheckboxRequiredValidator, MdCommonModule],
  declarations: [MdCheckbox, MdCheckboxRequiredValidator],
  providers: [FocusOriginMonitor]
})
export class MdCheckboxModule {}


export * from './checkbox';
export * from './checkbox-required-validator';
