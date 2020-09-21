/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PropertyNameUpgradeData, TargetVersion, VersionChanges} from '@angular/cdk/schematics';

export const propertyNames: VersionChanges<PropertyNameUpgradeData> = {
  [TargetVersion.V11]: [
    {
      pr: 'https://github.com/angular/components/pull/20449',
      changes: [
        {
          replace: 'getPopupConnectionElementRef',
          replaceWith: 'getConnectedOverlayOrigin',
          fileTypeFilter: {classes: ['MatDatepickerInput']}
        }
      ]
    }
  ],
  [TargetVersion.V9]: [
    {
      pr: 'https://github.com/angular/components/pull/17333',
      changes: [
        {
          replace: 'afterOpen',
          replaceWith: 'afterOpened',
          fileTypeFilter: {classes: ['MatDialogRef']}
        },
        {
          replace: 'beforeClose',
          replaceWith: 'beforeClosed',
          fileTypeFilter: {classes: ['MatDialogRef']}
        },
        {
          replace: 'afterOpen',
          replaceWith: 'afterOpened',
          fileTypeFilter: {classes: ['MatDialog']}
        }
      ]
    }
  ],
  [TargetVersion.V6]: [
    {
      pr: 'https://github.com/angular/components/pull/10163',
      changes: [
        {replace: 'change', replaceWith: 'selectionChange', fileTypeFilter: {classes: ['MatSelect']}}, {
          replace: 'onOpen',
          replaceWith: 'openedChange.pipe(filter(isOpen => isOpen))',
          fileTypeFilter: {classes: ['MatSelect']}
        },
        {
          replace: 'onClose',
          replaceWith: 'openedChange.pipe(filter(isOpen => !isOpen))',
          fileTypeFilter: {classes: ['MatSelect']}
        }
      ]
    },

    {
      pr: 'https://github.com/angular/components/pull/10218',
      changes: [{
        replace: 'align',
        replaceWith: 'labelPosition',
        fileTypeFilter: {classes: ['MatRadioGroup', 'MatRadioButton']}
      }]
    },

    {
      pr: 'https://github.com/angular/components/pull/10253',
      changes: [{
        replace: 'extraClasses',
        replaceWith: 'panelClass',
        fileTypeFilter: {classes: ['MatSnackBarConfig']}
      }]
    },

    {
      pr: 'https://github.com/angular/components/pull/10279',
      changes: [
        {
          replace: 'align',
          replaceWith: 'position',
          fileTypeFilter: {classes: ['MatDrawer', 'MatSidenav']}
        },
        {
          replace: 'onAlignChanged',
          replaceWith: 'onPositionChanged',
          fileTypeFilter: {classes: ['MatDrawer', 'MatSidenav']}
        },
        {
          replace: 'onOpen',
          replaceWith: 'openedChange.pipe(filter(isOpen => isOpen))',
          fileTypeFilter: {classes: ['MatDrawer', 'MatSidenav']}
        },
        {
          replace: 'onClose',
          replaceWith: 'openedChange.pipe(filter(isOpen => !isOpen))',
          fileTypeFilter: {classes: ['MatDrawer', 'MatSidenav']}
        }
      ]
    },

    {
      pr: 'https://github.com/angular/components/pull/10293',
      changes: [{
        replace: 'shouldPlaceholderFloat',
        replaceWith: 'shouldLabelFloat',
        fileTypeFilter: {classes: ['MatFormFieldControl', 'MatSelect']}
      }]
    },

    {
      pr: 'https://github.com/angular/components/pull/10294',
      changes: [
        {replace: 'dividerColor', replaceWith: 'color', fileTypeFilter: {classes: ['MatFormField']}}, {
          replace: 'floatPlaceholder',
          replaceWith: 'floatLabel',
          fileTypeFilter: {classes: ['MatFormField']}
        }
      ]
    },

    {
      pr: 'https://github.com/angular/components/pull/10309',
      changes: [
        {
          replace: 'selectChange',
          replaceWith: 'selectedTabChange',
          fileTypeFilter: {classes: ['MatTabGroup']}
        },
        {
          replace: '_dynamicHeightDeprecated',
          replaceWith: 'dynamicHeight',
          fileTypeFilter: {classes: ['MatTabGroup']}
        }
      ]
    },

    {
      pr: 'https://github.com/angular/components/pull/10311',
      changes: [
        {replace: 'destroy', replaceWith: 'destroyed', fileTypeFilter: {classes: ['MatChip']}},
        {replace: 'onRemove', replaceWith: 'removed', fileTypeFilter: {classes: ['MatChip']}}
      ]
    },

    {
      pr: 'https://github.com/angular/components/pull/10342',
      changes:
          [{replace: 'align', replaceWith: 'labelPosition', fileTypeFilter: {classes: ['MatCheckbox']}}]
    },

    {
      pr: 'https://github.com/angular/components/pull/10344',
      changes: [{
        replace: '_positionDeprecated',
        replaceWith: 'position',
        fileTypeFilter: {classes: ['MatTooltip']}
      }]
    },

    {
      pr: 'https://github.com/angular/components/pull/10373',
      changes: [
        {
          replace: '_thumbLabelDeprecated',
          replaceWith: 'thumbLabel',
          fileTypeFilter: {classes: ['MatSlider']}
        },
        {
          replace: '_tickIntervalDeprecated',
          replaceWith: 'tickInterval',
          fileTypeFilter: {classes: ['MatSlider']}
        }
      ]
    },
  ]
};
