/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@uiux/material/button';
import {MatSelectModule} from '@uiux/material/select';
import {MatTooltipModule} from '@uiux/material/tooltip';
import {MatPaginator} from './paginator';
import {MatPaginatorIntl} from './paginator-intl';


@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatSelectModule,
    MatTooltipModule,
  ],
  exports: [MatPaginator],
  declarations: [MatPaginator],
  providers: [MatPaginatorIntl],
})
export class MatPaginatorModule {}
