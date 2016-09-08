import {NgModule, ModuleWithProviders} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OverlayModule, OVERLAY_PROVIDERS} from '@angular2-material/core';
import {MatMenu} from './menu-directive';
import {MatMenuItem} from './menu-item';
import {MatMenuTrigger} from './menu-trigger';
export {MatMenu} from './menu-directive';
export {MatMenuItem} from './menu-item';
export {MatMenuTrigger} from './menu-trigger';


@NgModule({
  imports: [OverlayModule, CommonModule],
  exports: [MatMenu, MatMenuItem, MatMenuTrigger],
  declarations: [MatMenu, MatMenuItem, MatMenuTrigger],
})
export class MatMenuModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MatMenuModule,
      providers: OVERLAY_PROVIDERS,
    };
  }
}
