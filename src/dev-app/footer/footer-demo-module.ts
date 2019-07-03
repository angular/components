/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {FooterDemo} from './footer-demo';
import {MatFooterModule} from '@angular/material/footer';
import {CommonModule} from '@angular/common';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild([{path: '', component: FooterDemo}]),
        MatFooterModule,
    ],
  declarations: [FooterDemo],
})
export class FooterDemoModule {
}
