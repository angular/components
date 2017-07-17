/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export {
  // Coercing
  coerceBooleanProperty,
  coerceNumberProperty,

  // Observe Content
  ObserveContentModule,
  ObserveContent,

  // Accessibility
  A11yModule,
  FocusTrap,
  FocusTrapFactory,
  FocusTrapDeprecatedDirective,
  FocusTrapDirective,
  InteractivityChecker,
  ListKeyManager,
  CanDisable,
  AriaLivePoliteness,
  LIVE_ANNOUNCER_ELEMENT_TOKEN,
  LiveAnnouncer,
  LIVE_ANNOUNCER_PROVIDER_FACTORY,
  LIVE_ANNOUNCER_PROVIDER,
  isFakeMousedownFromScreenReader,

  // Bidi
  BidiModule,
  Dir,
  Direction,
  DIR_DOCUMENT,
  Directionality,
  DIRECTIONALITY_PROVIDER_FACTORY,

  // Keyboard
  UP_ARROW,
  DOWN_ARROW,
  RIGHT_ARROW,
  LEFT_ARROW,
  PAGE_UP,
  PAGE_DOWN,
  HOME,
  END,
  ENTER,
  SPACE,
  TAB,
  ESCAPE,
  BACKSPACE,
  DELETE,

  // Platform
  PlatformModule,
  Platform,
  getSupportedInputTypes,

  // Portal
  PortalModule,
  DomPortalHost,
  Portal,
  PortalHost,
  BasePortalHost,
  ComponentPortal,
  TemplatePortal,
  TemplatePortalDirective,
  PortalHostDirective
} from '@angular/cdk';
