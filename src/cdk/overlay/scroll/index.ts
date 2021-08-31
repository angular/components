/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export {CdkScrollable, ScrollDispatcher} from '@angular/cdk/scrolling';
export {BlockScrollStrategy} from './block-scroll-strategy';
export {CloseScrollStrategy} from './close-scroll-strategy';
export {NoopScrollStrategy} from './noop-scroll-strategy';
export {
  RepositionScrollStrategy,
  RepositionScrollStrategyConfig
} from './reposition-scroll-strategy';
// Export pre-defined scroll strategies and interface to build custom ones.
export {ScrollStrategy} from './scroll-strategy';
export {ScrollStrategyOptions} from './scroll-strategy-options';
