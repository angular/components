/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {BidiModule} from '../bidi';
import {PortalModule} from '../portal';
import {ScrollingModule} from '../scrolling';
import {NgModule} from '@angular/core';
import {Overlay} from './overlay';
import {
  CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER,
  CdkConnectedOverlay,
  CdkOverlayOrigin,
} from './overlay-directives';

@NgModule({
  imports: [BidiModule, PortalModule, ScrollingModule, CdkConnectedOverlay, CdkOverlayOrigin],
  exports: [CdkConnectedOverlay, CdkOverlayOrigin, ScrollingModule],
  providers: [Overlay, CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER],
})
export class OverlayModule {}
