import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MdSnackBar} from './snack-bar';
import {MdSnackBarContainer} from './snack-bar-container';
import {SimpleSnackBar} from './simple-snack-bar';
import {
  OverlayModule, PortalModule, MdCommonModule, _LIVE_ANNOUNCER_PROVIDER
} from '@angular/material/core';


@NgModule({
  imports: [
    OverlayModule,
    PortalModule,
    CommonModule,
    MdCommonModule,
  ],
  exports: [MdSnackBarContainer, MdCommonModule],
  declarations: [MdSnackBarContainer, SimpleSnackBar],
  entryComponents: [MdSnackBarContainer, SimpleSnackBar],
  providers: [MdSnackBar, _LIVE_ANNOUNCER_PROVIDER]
})
export class MdSnackBarModule {}


export * from './snack-bar';
export * from './snack-bar-container';
export * from './snack-bar-config';
export * from './snack-bar-ref';
export * from './simple-snack-bar';
