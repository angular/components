/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgModule} from '@angular/core';
import {MatCommonModule} from '@angular/material/core';
import {MatTabContent} from './tab-content';
import {MatTabLabel} from './tab-label';
import {MatTab} from './tab';
import {MatTabGroup} from './tab-group';
import {MatTabNav, MatTabNavPanel, MatTabLink} from './tab-nav-bar/tab-nav-bar';

@NgModule({
  imports: [
    MatCommonModule,
    MatTabContent,
    MatTabLabel,
    MatTab,
    MatTabGroup,
    MatTabNav,
    MatTabNavPanel,
    MatTabLink,
  ],
  exports: [
    MatCommonModule,
    MatTabContent,
    MatTabLabel,
    MatTab,
    MatTabGroup,
    MatTabNav,
    MatTabNavPanel,
    MatTabLink,
  ],
})
export class MatTabsModule {}
