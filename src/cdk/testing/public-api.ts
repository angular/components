/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export * from './component-harness';
export * from './harness-environment';
export * from './test-element';
export * from './element-dimensions';

// Internal export for the Zone task state interceptor logic. The functionality
// is used in both the `TestBed` and `protractor` harness environments.
export {
  InterceptedRootZone as ɵInterceptedRootZone,
  waitForProxyZoneToStabilize as ɵwaitForProxyZoneToStabilize,
  hasInterceptedRootZone as ɵhasInterceptedRootZone,
  waitForRootZoneToStabilize as ɵwaitForRootZoneToStabilize,
} from './zone-task-interceptor/index';
