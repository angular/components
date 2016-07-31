import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OverlayModule} from '@angular2-material/core/core';
import {MdMenu} from './menu-directive';
import {MdMenuItem} from './menu-item';
import {MdMenuTrigger} from './menu-trigger';

export {MdMenu} from './menu-directive';
export {MdMenuItem} from './menu-item';
export {MdMenuTrigger} from './menu-trigger';

export const MD_MENU_DIRECTIVES = [MdMenu, MdMenuItem, MdMenuTrigger];


@NgModule({
  imports: [OverlayModule, CommonModule],
  exports: MD_MENU_DIRECTIVES,
  declarations: MD_MENU_DIRECTIVES,
})
export class MdMenuModule { }
