/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {VersionChanges} from '../../update-tool/version-changes';

export interface MethodCallUpgradeData {
  className: string;
  method: string;
  invalidArgCounts: {count: number; message: string}[];
}

export const methodCallChecks: VersionChanges<MethodCallUpgradeData> = {};
