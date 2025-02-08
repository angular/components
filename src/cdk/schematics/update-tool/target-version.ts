/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/** Possible versions that can be automatically migrated by `ng update`. */

// tslint:disable-next-line:prefer-const-enum
export enum TargetVersion {
  V20 = 'version 20',
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
