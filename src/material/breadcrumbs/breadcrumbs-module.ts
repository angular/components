/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatCommonModule} from '@angular/material/core';
import {MatBreadcrumbs} from './breadcrumbs';


@NgModule({
  imports: [
    CommonModule,
    MatCommonModule,
  ],
  exports: [
    MatBreadcrumbs,
    MatCommonModule
  ],
  declarations: [
    MatBreadcrumbs
  ]
})
export class MatBreadcrumbsModule {}
