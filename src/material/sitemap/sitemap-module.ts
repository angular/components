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
import {MatTreeModule} from '@angular/material/tree';
import {MatIconModule} from '@angular/material/icon';
import {CdkTreeModule} from '@angular/cdk/tree';

import {MatSitemap} from './sitemap';

@NgModule({
  imports: [CommonModule, MatCommonModule, MatTreeModule, CdkTreeModule, MatIconModule],
  exports: [MatSitemap, MatCommonModule],
  declarations: [MatSitemap],
})
export class MatSitemapModule {}
