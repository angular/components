/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {
  MatToggleButtonModule
} from '@angular/material-experimental/mdc-toggle-button';
import {RouterModule} from '@angular/router';
import {MdcToggleButtonDemo} from './mdc-toggle-button-demo';

@NgModule({
  imports: [
    MatToggleButtonModule,
    RouterModule.forChild([{path: '', component: MdcToggleButtonDemo}])
  ],
  declarations: [MdcToggleButtonDemo]
})
export class MdcToggleButtonDemoModule {
}
