/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  TabGroupAlignExample,
  TabGroupAnimationsExample,
  TabGroupAsyncExample,
  TabGroupBasicExample,
  TabGroupCustomLabelExample,
  TabGroupDynamicExample,
  TabGroupDynamicHeightExample,
  TabGroupHeaderBelowExample,
  TabGroupInkBarExample,
  TabGroupLazyLoadedExample,
  TabGroupPaginatedExample,
  TabGroupStretchedExample,
  TabNavBarBasicExample,
} from '@angular/components-examples/material/tabs';
import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatTabsModule} from '@angular/material/tabs';

@Component({
  selector: 'tabs-demo',
  templateUrl: 'tabs-demo.html',
  imports: [
    TabGroupInkBarExample,
    TabGroupPaginatedExample,
    TabNavBarBasicExample,
    TabGroupStretchedExample,
    TabGroupLazyLoadedExample,
    TabGroupHeaderBelowExample,
    TabGroupDynamicExample,
    TabGroupAlignExample,
    TabGroupAnimationsExample,
    TabGroupAsyncExample,
    TabGroupBasicExample,
    TabGroupCustomLabelExample,
    TabGroupDynamicHeightExample,
    MatTabsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsDemo {}
