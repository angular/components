/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {
  MdcFormFieldExamplesModule
} from '@angular/components-examples/material-experimental/mdc-form-field';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material-experimental/mdc-autocomplete';
import {MatButtonModule} from '@angular/material-experimental/mdc-button';
import {MatCardModule} from '@angular/material-experimental/mdc-card';
import {MatCheckboxModule} from '@angular/material-experimental/mdc-checkbox';
import {MatFormFieldModule} from '@angular/material-experimental/mdc-form-field';
import {MatInputModule} from '@angular/material-experimental/mdc-input';
import {MatTabsModule} from '@angular/material-experimental/mdc-tabs';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {RouterModule} from '@angular/router';

import {MdcInputDemo} from './mdc-input-demo';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTabsModule,
    MatToolbarModule,
    MdcFormFieldExamplesModule,
    ReactiveFormsModule,
    RouterModule.forChild([{path: '', component: MdcInputDemo}]),
  ],
  declarations: [MdcInputDemo],
})
export class MdcInputDemoModule {
}
