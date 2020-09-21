/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TargetVersion} from '../../update-tool/target-version';
import {VersionChanges} from '../../update-tool/version-changes';

export interface PropertyNameUpgradeData {
  /** The property name to replace. */
  replace: string;
  /** The new name for the property. */
  replaceWith: string;
  /**
   * Controls which file types in which this replacement is made. If omitted, it is made in all
   * files.
   */
  fileTypeFilter: {
    /** Replace the property only when its type is one of the given Classes. */
    classes: string[];
  };
}

export const propertyNames: VersionChanges<PropertyNameUpgradeData> = {
  [TargetVersion.V9]: [
    {
      pr: 'https://github.com/angular/components/pull/17084',
      changes: [{
        replace: 'boundaryElementSelector',
        replaceWith: 'boundaryElement',
        fileTypeFilter: {classes: ['CdkDrag']}
      }]
    },
    {
      pr: 'https://github.com/angular/components/pull/17302',
      changes: [{
        replace: 'onChange',
        replaceWith: 'changed',
        fileTypeFilter: {classes: ['SelectionModel']}
      }]
    }
  ],
  [TargetVersion.V8]: [],
  [TargetVersion.V7]: [
    {
      pr: 'https://github.com/angular/components/pull/8286',
      changes:
          [{replace: 'onChange', replaceWith: 'changed', fileTypeFilter: {classes: ['SelectionModel']}}]
    },

    {
      pr: 'https://github.com/angular/components/pull/12927',
      changes: [{
        replace: 'flexibleDiemsions',
        replaceWith: 'flexibleDimensions',
        fileTypeFilter: {classes: ['CdkConnectedOverlay']}
      }]
    }
  ],

  [TargetVersion.V6]: [
    {
      pr: 'https://github.com/angular/components/pull/10161',
      changes: [
        {
          replace: '_deprecatedOrigin',
          replaceWith: 'origin',
          fileTypeFilter: {classes: ['CdkConnectedOverlay', 'ConnectedOverlayDirective']}
        },
        {
          replace: '_deprecatedPositions',
          replaceWith: 'positions',
          fileTypeFilter: {classes: ['CdkConnectedOverlay', 'ConnectedOverlayDirective']}
        },
        {
          replace: '_deprecatedOffsetX',
          replaceWith: 'offsetX',
          fileTypeFilter: {classes: ['CdkConnectedOverlay', 'ConnectedOverlayDirective']}
        },
        {
          replace: '_deprecatedOffsetY',
          replaceWith: 'offsetY',
          fileTypeFilter: {classes: ['CdkConnectedOverlay', 'ConnectedOverlayDirective']}
        },
        {
          replace: '_deprecatedWidth',
          replaceWith: 'width',
          fileTypeFilter: {classes: ['CdkConnectedOverlay', 'ConnectedOverlayDirective']}
        },
        {
          replace: '_deprecatedHeight',
          replaceWith: 'height',
          fileTypeFilter: {classes: ['CdkConnectedOverlay', 'ConnectedOverlayDirective']}
        },
        {
          replace: '_deprecatedMinWidth',
          replaceWith: 'minWidth',
          fileTypeFilter: {classes: ['CdkConnectedOverlay', 'ConnectedOverlayDirective']}
        },
        {
          replace: '_deprecatedMinHeight',
          replaceWith: 'minHeight',
          fileTypeFilter: {classes: ['CdkConnectedOverlay', 'ConnectedOverlayDirective']}
        },
        {
          replace: '_deprecatedBackdropClass',
          replaceWith: 'backdropClass',
          fileTypeFilter: {classes: ['CdkConnectedOverlay', 'ConnectedOverlayDirective']}
        },
        {
          replace: '_deprecatedScrollStrategy',
          replaceWith: 'scrollStrategy',
          fileTypeFilter: {classes: ['CdkConnectedOverlay', 'ConnectedOverlayDirective']}
        },
        {
          replace: '_deprecatedOpen',
          replaceWith: 'open',
          fileTypeFilter: {classes: ['CdkConnectedOverlay', 'ConnectedOverlayDirective']}
        },
        {
          replace: '_deprecatedHasBackdrop',
          replaceWith: 'hasBackdrop',
          fileTypeFilter: {classes: ['CdkConnectedOverlay', 'ConnectedOverlayDirective']}
        }
      ]
    },

    {
      pr: 'https://github.com/angular/components/pull/10257',
      changes: [
        {
          replace: '_deprecatedPortal',
          replaceWith: 'portal',
          fileTypeFilter: {classes: ['CdkPortalOutlet']}
        },
        {
          replace: '_deprecatedPortalHost',
          replaceWith: 'portal',
          fileTypeFilter: {classes: ['CdkPortalOutlet']}
        }
      ]
    },
  ]
};
