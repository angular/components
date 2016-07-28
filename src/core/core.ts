// RTL
export {Dir, LayoutDirection} from './rtl/dir';

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
  PORTAL_DIRECTIVES,
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
  OVERLAY_DIRECTIVES,
  OverlayModule,
} from './overlay/overlay-directives';
export {
  OverlayConnectionPosition,
  OriginConnectionPosition
} from './overlay/position/connected-position';

// Gestures
export {MdGestureConfig} from './gestures/MdGestureConfig';

// Ripple
export {MD_RIPPLE_DIRECTIVES, MdRipple} from './ripple/ripple';

// a11y
export {
  AriaLivePoliteness,
  MdLiveAnnouncer,
  LIVE_ANNOUNCER_ELEMENT_TOKEN
} from './a11y/live-announcer';

export {
  MdUniqueSelectionDispatcher,
  MdUniqueSelectionDispatcherListener
} from './coordination/unique-selection-dispatcher';
