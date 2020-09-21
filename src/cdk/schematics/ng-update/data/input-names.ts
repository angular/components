/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TargetVersion} from '../../update-tool/target-version';
import {VersionChanges} from '../../update-tool/version-changes';

export interface InputNameUpgradeData {
  /** The @Input() name to replace. */
  replace: string;
  /** The new name for the @Input(). */
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

export const inputNames: VersionChanges<InputNameUpgradeData> = {
  [TargetVersion.V6]: [
    {
      pr: 'https://github.com/angular/components/pull/10161',
      changes: [
        {
          replace: 'origin',
          replaceWith: 'cdkConnectedOverlayOrigin',
          fileTypeFilter:
              {attributes: ['cdk-connected-overlay', 'connected-overlay', 'cdkConnectedOverlay']}
        },
        {
          replace: 'positions',
          replaceWith: 'cdkConnectedOverlayPositions',
          fileTypeFilter:
              {attributes: ['cdk-connected-overlay', 'connected-overlay', 'cdkConnectedOverlay']}
        },
        {
          replace: 'offsetX',
          replaceWith: 'cdkConnectedOverlayOffsetX',
          fileTypeFilter:
              {attributes: ['cdk-connected-overlay', 'connected-overlay', 'cdkConnectedOverlay']}
        },
        {
          replace: 'offsetY',
          replaceWith: 'cdkConnectedOverlayOffsetY',
          fileTypeFilter:
              {attributes: ['cdk-connected-overlay', 'connected-overlay', 'cdkConnectedOverlay']}
        },
        {
          replace: 'width',
          replaceWith: 'cdkConnectedOverlayWidth',
          fileTypeFilter:
              {attributes: ['cdk-connected-overlay', 'connected-overlay', 'cdkConnectedOverlay']}
        },
        {
          replace: 'height',
          replaceWith: 'cdkConnectedOverlayHeight',
          fileTypeFilter:
              {attributes: ['cdk-connected-overlay', 'connected-overlay', 'cdkConnectedOverlay']}
        },
        {
          replace: 'minWidth',
          replaceWith: 'cdkConnectedOverlayMinWidth',
          fileTypeFilter:
              {attributes: ['cdk-connected-overlay', 'connected-overlay', 'cdkConnectedOverlay']}
        },
        {
          replace: 'minHeight',
          replaceWith: 'cdkConnectedOverlayMinHeight',
          fileTypeFilter:
              {attributes: ['cdk-connected-overlay', 'connected-overlay', 'cdkConnectedOverlay']}
        },
        {
          replace: 'backdropClass',
          replaceWith: 'cdkConnectedOverlayBackdropClass',
          fileTypeFilter:
              {attributes: ['cdk-connected-overlay', 'connected-overlay', 'cdkConnectedOverlay']}
        },
        {
          replace: 'scrollStrategy',
          replaceWith: 'cdkConnectedOverlayScrollStrategy',
          fileTypeFilter:
              {attributes: ['cdk-connected-overlay', 'connected-overlay', 'cdkConnectedOverlay']}
        },
        {
          replace: 'open',
          replaceWith: 'cdkConnectedOverlayOpen',
          fileTypeFilter:
              {attributes: ['cdk-connected-overlay', 'connected-overlay', 'cdkConnectedOverlay']}
        },
        {
          replace: 'hasBackdrop',
          replaceWith: 'cdkConnectedOverlayHasBackdrop',
          fileTypeFilter:
              {attributes: ['cdk-connected-overlay', 'connected-overlay', 'cdkConnectedOverlay']}
        }
      ]
    },
  ]
};
