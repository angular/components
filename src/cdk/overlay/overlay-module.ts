/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BidiModule} from '@uiux/cdk/bidi';
import {PortalModule} from '@uiux/cdk/portal';
import {ScrollDispatchModule, VIEWPORT_RULER_PROVIDER} from '@uiux/cdk/scrolling';
import {NgModule, Provider} from '@angular/core';
import {Overlay} from './overlay';
import {OVERLAY_CONTAINER_PROVIDER} from './overlay-container';
import {
  ConnectedOverlayDirective,
  MAT_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER,
  OverlayOrigin,
} from './overlay-directives';
import {OverlayPositionBuilder} from './position/overlay-position-builder';
import {ScrollStrategyOptions} from './scroll/scroll-strategy-options';

export const OVERLAY_PROVIDERS: Provider[] = [
  Overlay,
  OverlayPositionBuilder,
  VIEWPORT_RULER_PROVIDER,
  OVERLAY_CONTAINER_PROVIDER,
  MAT_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER,
];

@NgModule({
  imports: [BidiModule, PortalModule, ScrollDispatchModule],
  exports: [ConnectedOverlayDirective, OverlayOrigin, ScrollDispatchModule],
  declarations: [ConnectedOverlayDirective, OverlayOrigin],
  providers: [OVERLAY_PROVIDERS, ScrollStrategyOptions],
})
export class OverlayModule {}
