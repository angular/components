/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** Possible versions that can be automatically migrated by `ng update`. */
// Used in an `Object.keys` call below so it can't be `const enum`.
// tslint:disable-next-line:prefer-const-enum
export enum TargetVersion {
  V17 = 'version 17',
}

/**
 * Returns all versions that are supported by "ng update". The versions are determined
 * based on the "TargetVersion" enum.
 */
export function getAllVersionNames(): string[] {
  return Object.keys(TargetVersion).filter(enumValue => {
    return typeof (TargetVersion as Record<string, string | undefined>)[enumValue] === 'string';
  });
}
