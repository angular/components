/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {VersionChanges} from '../../update-tool/version-changes';

export interface InputNameUpgradeData {
  /** The @Input() name to replace. */
  replace: string;
  /** The new name for the @Input(). */
  replaceWith: string;
  /** Controls which elements and attributes in which this replacement is made. */
  limitedTo: {
    /** Limit to elements with any of these element tags. */
    elements?: string[];
    /** Limit to elements with any of these attributes. */
    attributes?: string[];
  };
}

export const inputNames: VersionChanges<InputNameUpgradeData> = {};
