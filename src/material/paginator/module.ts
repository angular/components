/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgModule} from '@angular/core';
import {MAT_PAGINATOR_INTL_PROVIDER} from './paginator-intl';
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatPaginator} from './paginator';

@NgModule({
  imports: [MatButtonModule, MatSelectModule, MatTooltipModule, MatPaginator],
  exports: [MatPaginator],
  providers: [MAT_PAGINATOR_INTL_PROVIDER],
})
export class MatPaginatorModule {}
