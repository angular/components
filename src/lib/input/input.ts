import {NgModule, ModuleWithProviders} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {MdPlaceholder, MdInputContainer, MdHint, MdInputDirective} from './input-container';
import {MdTextareaAutosize} from './autosize';
import {PlatformModule} from '../core/platform/index';


@NgModule({
  declarations: [
    MdPlaceholder,
    MdInputContainer,
    MdHint,
    MdTextareaAutosize,
    MdInputDirective
  ],
  imports: [
    CommonModule,
    FormsModule,
    PlatformModule,
  ],
  exports: [
    MdPlaceholder,
    MdInputContainer,
    MdHint,
    MdTextareaAutosize,
    MdInputDirective
  ],
})
export class MdInputModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdInputModule,
      providers: [],
    };
  }
}
