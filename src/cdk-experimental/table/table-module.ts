/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CdkTableModule as TableModule} from '@angular/cdk/table';

import {CdkTableVirtualScroll} from './table-virtual-scroll';



@NgModule({
  declarations: [CdkTableVirtualScroll],
  exports: [CdkTableVirtualScroll],
  imports: [
    TableModule,
  ],
})
export class CdkTableModule {}
