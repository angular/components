/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgModule} from '@angular/core';
import {MatPseudoCheckboxModule, MatRippleModule, MatCommonModule} from '../core';
import {MatDividerModule, MatDivider} from '@angular/material/divider';
import {MatActionList} from './action-list';
import {MatList, MatListItem} from './list';
import {MatListOption} from './list-option';
import {MatListSubheaderCssMatStyler} from './subheader';
import {
  MatListItemLine,
  MatListItemTitle,
  MatListItemMeta,
  MatListItemAvatar,
  MatListItemIcon,
} from './list-item-sections';
import {MatNavList} from './nav-list';
import {MatSelectionList} from './selection-list';
import {ObserversModule} from '@angular/cdk/observers';

// Export required to fix compiler confusion about import module paths
export {MatDivider};

@NgModule({
  imports: [
    ObserversModule,
    MatCommonModule,
    MatRippleModule,
    MatPseudoCheckboxModule,
    MatList,
    MatActionList,
    MatNavList,
    MatSelectionList,
    MatListItem,
    MatListOption,
    MatListSubheaderCssMatStyler,
    MatListItemAvatar,
    MatListItemIcon,
    MatListItemLine,
    MatListItemTitle,
    MatListItemMeta,
  ],
  exports: [
    MatList,
    MatActionList,
    MatNavList,
    MatSelectionList,
    MatListItem,
    MatListOption,
    MatListItemAvatar,
    MatListItemIcon,
    MatListSubheaderCssMatStyler,
    MatDividerModule,
    MatListItemLine,
    MatListItemTitle,
    MatListItemMeta,
  ],
})
export class MatListModule {}
