/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TargetVersion} from '../../update-tool/target-version';
import {VersionChanges} from '../../update-tool/version-changes';

export interface OutputNameUpgradeData {
  /** The @Output() name to replace. */
  replace: string;
  /** The new name for the @Output(). */
  replaceWith: string;
  /**
   * Controls which file types in which this replacement is made. If omitted, it is made in all
   * files.
   */
  fileTypeFilter: {
    /** Limit to elements with any of these element tags. */
    elements?: string[],
    /** Limit to elements with any of these attributes. */
    attributes?: string[],
  };
}

export const outputNames: VersionChanges<OutputNameUpgradeData> = {
  [TargetVersion.V10]: [
    {
      pr: 'https://github.com/angular/components/pull/19362',
      changes: [{
        replace: 'copied',
        replaceWith: 'cdkCopyToClipboardCopied',
        fileTypeFilter: {
          attributes: ['cdkCopyToClipboard']
        }
      }]
    }
  ],
  [TargetVersion.V6]: [],
};
