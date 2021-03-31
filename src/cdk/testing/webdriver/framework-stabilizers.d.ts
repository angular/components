/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * An Angular framework stabilizer function that takes a callback and calls it when the application
 * is stable, passing a boolean indicating if any work was done.
 */
declare interface FrameworkStabilizer {
  (callback: (didWork: boolean) => void): void;
}

/**
 * These hooks are exposed by Angular to register a callback for when the application is stable (no
 * more pending tasks).
 *
 * For the implementation, see:
 * https://github.com/angular/angular/blob/master/packages/platform-browser/src/browser/testability.ts#L30-L49
 */
declare const frameworkStabilizers: FrameworkStabilizer[];
