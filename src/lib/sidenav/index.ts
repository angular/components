import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MdCommonModule, A11yModule, OverlayModule} from '@angular/material/core';
import {MdSidenav, MdSidenavContainer} from './sidenav';


@NgModule({
  imports: [CommonModule, MdCommonModule, A11yModule, OverlayModule],
  exports: [MdSidenavContainer, MdSidenav, MdCommonModule],
  declarations: [MdSidenavContainer, MdSidenav],
})
export class MdSidenavModule {}


export * from './sidenav';
