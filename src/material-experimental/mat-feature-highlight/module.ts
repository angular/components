/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BidiModule} from '@angular/cdk/bidi';
import {PortalModule} from '@angular/cdk/portal';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

import {FeatureHighlight} from './feature-highlight';
import {FeatureHighlightCalloutContainer} from './feature-highlight-callout-container';
import {FeatureHighlightContainer} from './feature-highlight-container';
import {FeatureHighlightClose, FeatureHighlightContent, FeatureHighlightTarget, FeatureHighlightTitle} from './feature-highlight-content-directives';
import {FeatureHighlightOverlay} from './feature-highlight-overlay';
import {FeatureHighlightOverlayContainer} from './feature-highlight-overlay-container';

@NgModule({
  declarations: [
    FeatureHighlightCalloutContainer,
    FeatureHighlightClose,
    FeatureHighlightContainer,
    FeatureHighlightContent,
    FeatureHighlightTarget,
    FeatureHighlightTitle,
  ],
  imports: [
    BidiModule,
    CommonModule,
    PortalModule,
  ],
  exports: [
    FeatureHighlightClose,
    FeatureHighlightContent,
    FeatureHighlightTarget,
    FeatureHighlightTitle,
  ],
  providers: [
    FeatureHighlight,
    FeatureHighlightOverlay,
    FeatureHighlightOverlayContainer,
  ],
  entryComponents: [
    FeatureHighlightContainer,
    FeatureHighlightCalloutContainer,
  ],
})
export class FeatureHighlightModule {
}
