/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {A11yModule, BidiModule, ObserveContentModule, PortalModule} from '@angular/cdk';
import {MdLineModule} from './line/line';
import {MdOptionModule} from './option/index';
import {OverlayModule} from './overlay/index';
import {MdSelectionModule} from './selection/index';
import {MdRippleModule} from './ripple/index';

// Re-exports of the CDK to avoid breaking changes.
export * from './cdk-exports';

// Option
export * from './option/index';

// Overlay
export * from './overlay/index';

// Gestures
export {GestureConfig} from './gestures/gesture-config';
// Explicitly specify the interfaces which should be re-exported, because if everything
// is re-exported, module bundlers may run into issues with treeshaking.
export {HammerInput, HammerManager} from './gestures/gesture-annotations';

// Ripple
export * from './ripple/index';

// Selection
export * from './selection/selection';

export {
  UniqueSelectionDispatcher,
  UniqueSelectionDispatcherListener,
  UNIQUE_SELECTION_DISPATCHER_PROVIDER,
} from './coordination/unique-selection-dispatcher';

export {MdLineModule, MdLine, MdLineSetter} from './line/line';

// Style
export * from './style/index';

// Misc
export {ComponentType} from './overlay/generic-component-type';

export * from './compatibility/compatibility';

// Animation
export * from './animation/animation';

// Selection
export * from './selection/index';

// Compatibility
export {CompatibilityModule, NoConflictStyleCompatibilityMode} from './compatibility/compatibility';

// Common material module
export {MdCommonModule, MATERIAL_SANITY_CHECKS} from './common-behaviors/common-module';

// Datetime
export * from './datetime/index';

// Placeholder
export {
  FloatPlaceholderType,
  PlaceholderOptions,
  MD_PLACEHOLDER_GLOBAL_OPTIONS
} from './placeholder/placeholder-options';

// Error
export {
  ErrorStateMatcher,
  ErrorOptions,
  MD_ERROR_GLOBAL_OPTIONS,
  defaultErrorStateMatcher,
  showOnDirtyErrorStateMatcher
} from './error/error-options';

@NgModule({
  imports: [
    MdLineModule,
    BidiModule,
    MdRippleModule,
    ObserveContentModule,
    PortalModule,
    OverlayModule,
    A11yModule,
    MdOptionModule,
    MdSelectionModule,
  ],
  exports: [
    MdLineModule,
    BidiModule,
    MdRippleModule,
    ObserveContentModule,
    PortalModule,
    OverlayModule,
    A11yModule,
    MdOptionModule,
    MdSelectionModule,
  ],
})
export class MdCoreModule {}
