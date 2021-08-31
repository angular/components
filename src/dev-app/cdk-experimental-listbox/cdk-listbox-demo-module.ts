/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CdkListboxModule} from '@angular/cdk-experimental/listbox';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';

import {CdkListboxDemo} from './cdk-listbox-demo';

@NgModule({
  imports: [
    CdkListboxModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([{path: '', component: CdkListboxDemo}]),
  ],
  declarations: [CdkListboxDemo],
})
export class CdkListboxDemoModule {
}
