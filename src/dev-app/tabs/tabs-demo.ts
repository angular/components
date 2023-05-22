/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {MatTabsModule} from '@angular/material/tabs';
import {
  TabGroupInkBarExample,
  TabGroupInvertedExample,
  TabGroupPaginatedExample,
  TabNavBarBasicExample,
  TabGroupThemeExample,
  TabGroupStretchedExample,
  TabGroupPreserveContentExample,
  TabGroupLazyLoadedExample,
  TabGroupHeaderBelowExample,
  TabGroupDynamicExample,
  TabGroupHarnessExample,
  TabGroupAlignExample,
  TabGroupAnimationsExample,
  TabGroupAsyncExample,
  TabGroupBasicExample,
  TabGroupCustomLabelExample,
  TabGroupDynamicHeightExample,
} from '@angular/components-examples/material/tabs';

@Component({
  selector: 'tabs-demo',
  templateUrl: 'tabs-demo.html',
  standalone: true,
  imports: [
    TabGroupInkBarExample,
    TabGroupInvertedExample,
    TabGroupPaginatedExample,
    TabNavBarBasicExample,
    TabGroupThemeExample,
    TabGroupStretchedExample,
    TabGroupPreserveContentExample,
    TabGroupLazyLoadedExample,
    TabGroupHeaderBelowExample,
    TabGroupDynamicExample,
    TabGroupHarnessExample,
    TabGroupAlignExample,
    TabGroupAnimationsExample,
    TabGroupAsyncExample,
    TabGroupBasicExample,
    TabGroupCustomLabelExample,
    TabGroupDynamicHeightExample,
    MatTabsModule,
  ],
})
export class TabsDemo {}
