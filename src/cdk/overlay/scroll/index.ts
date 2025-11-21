/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export {CdkScrollable, ScrollDispatcher} from '../../scrolling';

// Export pre-defined scroll strategies and interface to build custom ones.
export {ScrollStrategy} from './scroll-strategy';
export {ScrollStrategyOptions} from './scroll-strategy-options';
export {
  RepositionScrollStrategy,
  RepositionScrollStrategyConfig,
  createRepositionScrollStrategy,
} from './reposition-scroll-strategy';
export {CloseScrollStrategy, createCloseScrollStrategy} from './close-scroll-strategy';
export {NoopScrollStrategy, createNoopScrollStrategy} from './noop-scroll-strategy';
export {BlockScrollStrategy, createBlockScrollStrategy} from './block-scroll-strategy';
