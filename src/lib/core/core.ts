import {NgModule, ModuleWithProviders} from '@angular/core';
import {MatLineModule} from './line/line';
import {RtlModule} from './rtl/dir';
import {MatRippleModule} from './ripple/ripple';
import {PortalModule} from './portal/portal-directives';
import {OverlayModule} from './overlay/overlay-directives';
import {MatLiveAnnouncer} from './a11y/live-announcer';

// RTL
export {Dir, LayoutDirection, RtlModule} from './rtl/dir';

// Portals
export {
  Portal,
  PortalHost,
  BasePortalHost,
  ComponentPortal,
  TemplatePortal
} from './portal/portal';
export {
  PortalHostDirective,
  TemplatePortalDirective,
  PortalModule,
} from './portal/portal-directives';
export {DomPortalHost} from './portal/dom-portal-host';

// Overlay
export {Overlay, OVERLAY_PROVIDERS} from './overlay/overlay';
export {OverlayContainer} from './overlay/overlay-container';
export {OverlayRef} from './overlay/overlay-ref';
export {OverlayState} from './overlay/overlay-state';
export {
  ConnectedOverlayDirective,
  OverlayOrigin,
  OverlayModule,
} from './overlay/overlay-directives';
export * from './overlay/position/connected-position-strategy';
export * from './overlay/position/connected-position';

// Gestures
export {MatGestureConfig} from './gestures/gesture-config';

// Ripple
export {MatRipple, MatRippleModule} from './ripple/ripple';

// a11y
export {
  AriaLivePoliteness,
  MatLiveAnnouncer,
  LIVE_ANNOUNCER_ELEMENT_TOKEN,
} from './a11y/live-announcer';

export {
  MatUniqueSelectionDispatcher,
  MatUniqueSelectionDispatcherListener
} from './coordination/unique-selection-dispatcher';

export {MatLineModule, MatLine, MatLineSetter} from './line/line';

// Style
export {applyCssTransform} from './style/apply-transform';

// Error
export {MatError} from './errors/error';

// Annotations.
export {BooleanFieldValue} from './annotations/field-value';

// Misc
export {ComponentType} from './overlay/generic-component-type';

// Keybindings
export * from './keyboard/keycodes';


@NgModule({
  imports: [MatLineModule, RtlModule, MatRippleModule, PortalModule, OverlayModule],
  exports: [MatLineModule, RtlModule, MatRippleModule, PortalModule, OverlayModule],
})
export class MatCoreModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MatCoreModule,
      providers: [MatLiveAnnouncer]
    };
  }
}
