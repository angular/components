/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  MatButtonModule,
  MatCheckboxModule,
  MatDatepickerModule,
  MatDividerModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatNativeDateModule,
  MatSelectModule
} from '@angular/material';
import {RouterModule} from '@angular/router';
import {CustomHeader, CustomHeaderNgContent, DatepickerDemo, Footer} from './datepicker-demo';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatNativeDateModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatDividerModule,
    RouterModule.forChild([{path: '', component: DatepickerDemo}]),
  ],
  declarations: [CustomHeader, CustomHeaderNgContent, DatepickerDemo, Footer],
  entryComponents: [CustomHeader, CustomHeaderNgContent, Footer],
})
export class DatepickerDemoModule {
}
