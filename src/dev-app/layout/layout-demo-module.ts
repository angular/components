/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {CdkLayoutExamplesModule} from '@angular/components-examples/cdk/layout';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import {LayoutDemo} from './layout-demo';

@NgModule({
  imports: [
    CommonModule,
    CdkLayoutExamplesModule,
    RouterModule.forChild([{path: '', component: LayoutDemo}]),
  ],
  declarations: [LayoutDemo],
})
export class LayoutDemoModule {
}
