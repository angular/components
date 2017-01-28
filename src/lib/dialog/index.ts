import {NgModule, ModuleWithProviders} from '@angular/core';
import {
  OverlayModule,
  PortalModule,
  A11yModule,
  CompatibilityModule,
} from '../core';
import {MdDialog} from './dialog';
import {MdDialogContainer} from './dialog-container';
import {MdDialogElement, MdDialogPortal} from './dialog-element';
import {
  MdDialogClose,
  MdDialogContent,
  MdDialogTitle,
  MdDialogActions
} from './dialog-content-directives';

@NgModule({
  imports: [
    OverlayModule,
    PortalModule,
    A11yModule,
    CompatibilityModule,
  ],
  exports: [
    MdDialogContainer,
    MdDialogClose,
    MdDialogTitle,
    MdDialogContent,
    MdDialogActions,
    MdDialogElement,
    MdDialogPortal,
    CompatibilityModule,
  ],
  declarations: [
    MdDialogContainer,
    MdDialogClose,
    MdDialogTitle,
    MdDialogActions,
    MdDialogContent,
    MdDialogElement,
    MdDialogPortal,
  ],
  providers: [
    MdDialog,
  ],
  entryComponents: [MdDialogContainer],
})
export class MdDialogModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdDialogModule,
      providers: [],
    };
  }
}

export * from './dialog';
export * from './dialog-element';
export * from './dialog-container';
export * from './dialog-content-directives';
export * from './dialog-config';
export * from './dialog-ref';
